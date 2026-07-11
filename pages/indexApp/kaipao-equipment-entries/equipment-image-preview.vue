<template>
  <u-popup
    :model-value="modelValue"
    mode="center"
    :mask-close-able="!downloading"
    :safe-area-inset-bottom="true"
    @update:modelValue="updateVisible"
  >
    <view class="table-preview-modal">
      <view class="preview-head">
        <text>表格预览</text>

        <button
          class="preview-close"
          :disabled="downloading"
          @tap.stop="close"
        >
          关闭
        </button>
      </view>

      <view
        v-if="unsavedWarning"
        class="preview-unsaved-warning"
      >
        当前预览可能包含尚未保存的修改。
      </view>

      <view
        class="preview-stage"
        :style="previewVerticalScrollStyle"
        @touchstart="handleTouchStart"
        @touchmove.stop.prevent="handleTouchMove"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchEnd"
        @wheel.stop.prevent="handleWheel"
        @mousedown.prevent="handleMouseDown"
      >
        <view
          v-if="layoutReady && previewImagePath"
          class="preview-image-wrap"
          :style="previewImageTransformStyle"
        >
          <image
            class="preview-canvas-image"
            :src="previewImagePath"
            mode="fill"
            :style="previewImageStyle"
            :draggable="false"
          />
        </view>

        <view
          v-else
          class="preview-loading"
        >
          正在生成表格预览
        </view>

        <view class="preview-floating-tools">
          <button
            class="preview-tool"
            aria-label="放大"
            :disabled="!layoutReady"
            @tap="changePreviewScale(1.2)"
          >
            <u-icon
              name="plus"
              size="30"
              color="currentColor"
            />
          </button>

          <button
            class="preview-tool"
            aria-label="缩小"
            :disabled="!layoutReady"
            @tap="changePreviewScale(1 / 1.2)"
          >
            <u-icon name="minus" size="30" color="currentColor" />
          </button>

          <button
            class="preview-tool"
            aria-label="顺时针旋转"
            :disabled="!layoutReady"
            @tap="rotatePreview"
          >
            <u-icon name="reload" size="30" color="currentColor" />
          </button>

          <button
            class="preview-tool"
            aria-label="复位"
            :disabled="!layoutReady"
            @tap="resetPreviewTransform"
          >
            <u-icon name="scan" size="30" color="currentColor" />
          </button>

          <button
            class="preview-tool download"
            :class="{ disabled: downloading || !layoutReady }"
            aria-label="下载图片"
            :disabled="downloading || !layoutReady"
            @tap="download"
          >
            <u-icon name="download" size="30" color="currentColor" />
          </button>
        </view>
      </view>
    </view>
  </u-popup>

  <!-- 测量和导出共用 Canvas -->
  <canvas
    id="previewEntryCanvas"
    type="2d"
    class="preview-entry-canvas"
    :style="{
      width: `${canvasWidth}px`,
      height: `${canvasHeight}px`,
    }"
  />
</template>

<script setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';

/**
 * 所有配置先使用 rpx 定义，
 * 初始化后统一转换为 px。
 */
const TABLE_RPX = {
  outerPadding: 16,

  indexWidth: 108,
  cellWidth: 365,

  minHeaderHeight: 76,
  minCompactRowHeight: 104,
  minFullRowHeight: 156,

  cellPaddingX: 18,
  cellPaddingY: 18,

  logoSize: 36,
  logoGap: 12,

  headerFontSize: 25,
  headerLineHeight: 36,

  indexFontSize: 23,

  titleFontSize: 23,
  titleLineHeight: 34,

  descriptionFontSize: 20,
  descriptionLineHeight: 30,

  titleDescriptionGap: 12,

  textBottomSafety: 2,
};

const COLORS = {
  background: '#ffffff',
  headerBackground: '#ecf5ff',
  headerText: '#1769e0',
  indexText: '#1769e0',
  primaryText: '#172033',
  secondaryText: '#64748b',
  border: '#dbe5f2',
};

const FONT_FAMILY =
  '"PingFang SC", "Microsoft YaHei", Arial, sans-serif';

/**
 * 预览直接使用线上地址。
 * 导出时会先下载为本地临时文件。
 */
const seasonLogoMap = {
  G1: 'https://www.gaobug.com/img/static/kaipao/G/G1.png',
  G2: 'https://www.gaobug.com/img/static/kaipao/G/G2.png',
  G3: 'https://www.gaobug.com/img/static/kaipao/G/G3.png',
};

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  parts: {
    type: Array,
    default: () => [],
  },

  rows: {
    type: Array,
    default: () => [],
  },

  showFullName: {
    type: Boolean,
    default: true,
  },

  unsavedWarning: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue',
]);

const { proxy } = getCurrentInstance();

const downloading = ref(false);
const layoutReady = ref(false);
const previewImagePath = ref('');
const previewScale = ref(1);
const previewRotation = ref(0);
const previewOffsetX = ref(0);
const previewOffsetY = ref(0);

const canvasWidth = ref(1);
const canvasHeight = ref(1);

// 微信小程序的 scroll-view 需要明确的像素尺寸。
const previewViewportWidth = ref(320);
const previewViewportHeight = ref(420);

let canvasNode = null;
let canvasContext = null;
let touchStartDistance = 0;
let touchStartScale = 1;
let touchStartPoint = null;
let touchStartOffset = null;
let lastTouchPoint = null;
let previewStageRect = null;

/**
 * 保存已经下载过的线上图片临时路径。
 *
 * key：线上 URL
 * value：微信本地临时路径
 */
const exportImageCache = new Map();

function rpxToPx(value) {
  const result = Number(
    uni.upx2px(value)
  );

  if (!Number.isFinite(result)) {
    return value;
  }

  if (value === 0) {
    return 0;
  }

  return Math.max(1, result);
}

function getWindowMetrics() {
  try {
    if (typeof uni.getWindowInfo === 'function') {
      return uni.getWindowInfo();
    }

    if (
      typeof wx !== 'undefined' &&
      typeof wx.getWindowInfo === 'function'
    ) {
      return wx.getWindowInfo();
    }

    return {};
  } catch (error) {
    return {};
  }
}

function getSafeBottom(windowInfo) {
  const safeAreaInsetsBottom =
    Number(windowInfo.safeAreaInsets?.bottom);

  if (Number.isFinite(safeAreaInsetsBottom)) {
    return safeAreaInsetsBottom;
  }

  const windowHeight =
    Number(windowInfo.windowHeight);

  const safeAreaBottom =
    Number(windowInfo.safeArea?.bottom);

  if (
    Number.isFinite(windowHeight) &&
    Number.isFinite(safeAreaBottom)
  ) {
    return Math.max(
      0,
      windowHeight - safeAreaBottom
    );
  }

  return 0;
}

const TABLE = reactive(
  Object.fromEntries(
    Object.entries(TABLE_RPX).map(
      ([key, value]) => [
        key,
        rpxToPx(value),
      ]
    )
  )
);

const tableParts = computed(() => {
  return Array.isArray(props.parts)
    ? props.parts
    : [];
});

const tableRows = computed(() => {
  return Array.isArray(props.rows)
    ? props.rows
    : [];
});

const tableLayout = ref({
  width: 1,
  height: 1,

  header: {
    height: 1,
    columns: [],
  },

  rows: [],
});

const previewImageStyle = computed(() => ({
  width: `${tableLayout.value.width}px`,
  height: `${tableLayout.value.height}px`,
}));

const previewImageTransformStyle = computed(() => ({
  width: `${tableLayout.value.width}px`,
  height: `${tableLayout.value.height}px`,
  marginLeft: `-${tableLayout.value.width / 2}px`,
  marginTop: `-${tableLayout.value.height / 2}px`,
  transform:
    `translate(${previewOffsetX.value}px, ${previewOffsetY.value}px) ` +
    `rotate(${previewRotation.value}deg) ` +
    `scale(${previewScale.value})`,
}));

const previewVerticalScrollStyle = computed(() => ({
  width: `${previewViewportWidth.value}px`,
  height: `${previewViewportHeight.value}px`,
}));

function updatePreviewViewport() {
  const systemInfo = getWindowMetrics();
  const windowWidth = Number(systemInfo.windowWidth) || 375;
  const windowHeight = Number(systemInfo.windowHeight) || 667;
  const safeBottom = getSafeBottom(systemInfo);

  const modalWidth = Math.max(1, Math.floor(windowWidth * 0.98));
  const modalHeight = Math.max(1, Math.floor(windowHeight * 0.94));

  // 头部约 88rpx，底部工具栏约 86rpx，再预留边框误差。
  const fixedHeight =
    rpxToPx(88) +
    (props.unsavedWarning
      ? rpxToPx(74)
      : 0) +
    safeBottom +
    4;

  previewViewportWidth.value = modalWidth;
  previewViewportHeight.value = Math.max(
    180,
    modalHeight - fixedHeight
  );
}

function updatePreviewStageRect() {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .in(proxy)
      .select('.preview-stage')
      .boundingClientRect((rect) => {
        previewStageRect = rect || null;
        resolve();
      })
      .exec();
  });
}

function clampScale(scale) {
  return Math.min(4, Math.max(0.1, scale));
}

function resetPreviewTransform() {
  const width = tableLayout.value.width;
  const height = tableLayout.value.height;
  const fitScale = Math.min(
    previewViewportWidth.value / Math.max(1, width),
    previewViewportHeight.value / Math.max(1, height),
    1
  );

  previewScale.value = clampScale(fitScale);
  previewRotation.value = 0;
  previewOffsetX.value = 0;
  previewOffsetY.value = 0;
}

function getPointerPosition(pointer) {
  const x = Number(
    pointer?.clientX ??
    pointer?.pageX ??
    pointer?.x
  );
  const y = Number(
    pointer?.clientY ??
    pointer?.pageY ??
    pointer?.y
  );

  return Number.isFinite(x) && Number.isFinite(y)
    ? { x, y }
    : null;
}

function getStagePoint(pointer) {
  const rect = previewStageRect;
  const position = getPointerPosition(pointer);

  if (!rect || !position) {
    return {
      x: previewViewportWidth.value / 2,
      y: previewViewportHeight.value / 2,
    };
  }

  return {
    x: position.x - rect.left,
    y: position.y - rect.top,
  };
}

function zoomPreviewAt(
  scale,
  point = {
    x: previewViewportWidth.value / 2,
    y: previewViewportHeight.value / 2,
  },
  baseScale = previewScale.value,
  baseOffset = {
    x: previewOffsetX.value,
    y: previewOffsetY.value,
  },
  anchorPoint = point
) {
  const nextScale = clampScale(scale);
  const ratio = nextScale / baseScale;
  const centerX = previewViewportWidth.value / 2;
  const centerY = previewViewportHeight.value / 2;

  previewOffsetX.value =
    point.x - centerX -
    (anchorPoint.x - centerX - baseOffset.x) * ratio;
  previewOffsetY.value =
    point.y - centerY -
    (anchorPoint.y - centerY - baseOffset.y) * ratio;
  previewScale.value = nextScale;
}

function changePreviewScale(multiplier) {
  zoomPreviewAt(previewScale.value * multiplier);
}

function getTouchDistance(touches) {
  const first = getPointerPosition(touches[0]);
  const second = getPointerPosition(touches[1]);

  if (!first || !second) return 0;

  const x = first.x - second.x;
  const y = first.y - second.y;
  return Math.hypot(x, y);
}

function getTouchCenter(touches) {
  const first = getPointerPosition(touches[0]);
  const second = getPointerPosition(touches[1]);

  if (!first || !second) return null;

  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function handleTouchStart(event) {
  const touches = event.touches || [];

  if (touches.length >= 2) {
    touchStartDistance = getTouchDistance(touches);
    touchStartScale = previewScale.value;
    touchStartPoint = getStagePoint(getTouchCenter(touches));
    touchStartOffset = {
      x: previewOffsetX.value,
      y: previewOffsetY.value,
    };
    lastTouchPoint = null;
    return;
  }

  if (touches.length === 1) {
    lastTouchPoint = getPointerPosition(touches[0]);
  }
}

function handleTouchMove(event) {
  const touches = event.touches || [];

  if (touches.length >= 2 && touchStartDistance) {
    const point = getStagePoint(getTouchCenter(touches));

    zoomPreviewAt(
      touchStartScale *
        getTouchDistance(touches) /
        touchStartDistance,
      point,
      touchStartScale,
      touchStartOffset,
      touchStartPoint
    );
    return;
  }

  if (touches.length === 1 && lastTouchPoint) {
    const point = getPointerPosition(touches[0]);

    if (!point) return;

    previewOffsetX.value += point.x - lastTouchPoint.x;
    previewOffsetY.value += point.y - lastTouchPoint.y;
    lastTouchPoint = point;
  }
}

function handleTouchEnd(event) {
  const touches = event.touches || [];
  touchStartDistance = 0;
  touchStartPoint = null;
  touchStartOffset = null;

  lastTouchPoint = touches.length === 1
    ? getPointerPosition(touches[0])
    : null;
}

function handleWheel(event) {
  const source = event.originalEvent || event;
  const delta = Number(
    source.deltaY ??
    source.detail?.deltaY ??
    -source.wheelDelta
  ) || 0;

  if (!delta) return;

  zoomPreviewAt(
    previewScale.value * (delta < 0 ? 1.12 : 0.89),
    getStagePoint(source)
  );
}

function handleMouseDown(event) {
  lastTouchPoint = getPointerPosition(event);
}

function handleMouseMove(event) {
  if (!lastTouchPoint) return;

  const point = getPointerPosition(event);

  if (!point) return;

  previewOffsetX.value += point.x - lastTouchPoint.x;
  previewOffsetY.value += point.y - lastTouchPoint.y;
  lastTouchPoint = point;
}

function handleMouseUp() {
  lastTouchPoint = null;
}

function rotatePreview() {
  previewRotation.value =
    (previewRotation.value + 90) % 360;
}

function getRowCell(row, index) {
  return row?.cells?.[index] || {};
}

function getSeasonLogo(season) {
  return seasonLogoMap[season] || '';
}

function updateVisible(value) {
  emit('update:modelValue', value);
}

function close() {
  if (downloading.value) return;

  updateVisible(false);
}

function setCanvasFont(
  ctx,
  fontSize,
  fontWeight = 400
) {
  const font =
    `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;

  try {
    ctx.font = font;
  } catch (error) {
    // 兼容旧版 CanvasContext。
  }

  if (
    typeof ctx.setFontSize ===
    'function'
  ) {
    ctx.setFontSize(fontSize);
  }
}

function measureTextWidth(ctx, text) {
  const value = String(text ?? '');

  if (!value) {
    return 0;
  }

  const result = ctx.measureText(value);

  return Number(result?.width) || 0;
}

/**
 * 使用 Canvas 的真实文字宽度计算换行。
 */
function wrapCanvasText(
  ctx,
  text,
  maxWidth
) {
  const value = String(text ?? '');

  if (!value || maxWidth <= 0) {
    return [];
  }

  const availableWidth = Math.max(
    1,
    maxWidth
  );

  const paragraphs =
    value.split(/\r?\n/);

  const lines = [];

  paragraphs.forEach(
    (paragraph, paragraphIndex) => {
      if (!paragraph) {
        lines.push('');
      } else {
        let currentLine = '';

        Array.from(paragraph).forEach(
          (character) => {
            const candidate =
              currentLine + character;

            if (
              currentLine &&
              measureTextWidth(
                ctx,
                candidate
              ) > availableWidth
            ) {
              lines.push(currentLine);
              currentLine = character;
            } else {
              currentLine = candidate;
            }
          }
        );

        if (currentLine) {
          lines.push(currentLine);
        }
      }

      if (
        paragraphIndex <
        paragraphs.length - 1
      ) {
        lines.push('');
      }
    }
  );

  return lines.length
    ? lines
    : [''];
}

function createHeaderLayout(ctx) {
  setCanvasFont(
    ctx,
    TABLE.headerFontSize,
    600
  );

  const columns = [
    {
      key: '__index__',
      isIndex: true,
      width: TABLE.indexWidth,

      lines: wrapCanvasText(
        ctx,
        '序号',
        TABLE.indexWidth -
          TABLE.cellPaddingX * 2
      ),
    },

    ...tableParts.value.map(
      (part, index) => ({
        key:
          part?.key ??
          `header-${index}`,

        isIndex: false,
        width: TABLE.cellWidth,

        lines: wrapCanvasText(
          ctx,
          part?.label ?? '',
          TABLE.cellWidth -
            TABLE.cellPaddingX * 2
        ),
      })
    ),
  ];

  const maxLineCount = Math.max(
    1,
    ...columns.map((column) => {
      return Math.max(
        1,
        column.lines.length
      );
    })
  );

  const requiredHeight =
    maxLineCount *
      TABLE.headerLineHeight +
    TABLE.cellPaddingY * 2 +
    TABLE.textBottomSafety;

  return {
    columns,

    height: Math.max(
      TABLE.minHeaderHeight,
      requiredHeight
    ),
  };
}

function createCellLayout(
  ctx,
  row,
  cellIndex
) {
  const cell = getRowCell(
    row,
    cellIndex
  );

  const displayName = String(
    cell?.displayName ?? ''
  );

  const description = String(
    cell?.name ?? ''
  );

  if (!displayName) {
    return {
      key:
        cell?.key ??
        `empty-${cellIndex}`,

      cell,
      logo: '',
      hasContent: false,

      titleLines: [],
      descriptionLines: [],

      titleBlockHeight: 0,
      descriptionHeight: 0,
      contentHeight: 0,
    };
  }

  const logo =
    getSeasonLogo(cell.season);

  const contentWidth =
    TABLE.cellWidth -
    TABLE.cellPaddingX * 2;

  const titleAvailableWidth =
    contentWidth -
    (logo
      ? TABLE.logoSize +
        TABLE.logoGap
      : 0);

  setCanvasFont(
    ctx,
    TABLE.titleFontSize,
    600
  );

  const titleLines =
    wrapCanvasText(
      ctx,
      displayName,
      Math.max(
        1,
        titleAvailableWidth
      )
    );

  const titleTextHeight =
    Math.max(
      1,
      titleLines.length
    ) *
      TABLE.titleLineHeight +
    TABLE.textBottomSafety;

  const titleBlockHeight =
    Math.max(
      logo ? TABLE.logoSize : 0,
      titleTextHeight
    );

  let descriptionLines = [];

  if (
    props.showFullName &&
    description
  ) {
    setCanvasFont(
      ctx,
      TABLE.descriptionFontSize,
      400
    );

    descriptionLines =
      wrapCanvasText(
        ctx,
        description,
        contentWidth
      );
  }

  const descriptionHeight =
    descriptionLines.length
      ? descriptionLines.length *
          TABLE.descriptionLineHeight +
        TABLE.textBottomSafety
      : 0;

  const contentHeight =
    titleBlockHeight +
    (descriptionLines.length
      ? TABLE.titleDescriptionGap
      : 0) +
    descriptionHeight;

  return {
    key:
      cell?.key ??
      `cell-${cellIndex}`,

    cell,
    logo,
    hasContent: true,

    titleLines,
    descriptionLines,

    titleBlockHeight,
    descriptionHeight,
    contentHeight,
  };
}

function createRowLayout(
  ctx,
  row,
  rowIndex
) {
  const cells =
    tableParts.value.map(
      (part, cellIndex) => {
        return createCellLayout(
          ctx,
          row,
          cellIndex
        );
      }
    );

  const maxContentHeight = Math.max(
    0,
    ...cells.map(
      (cellLayout) =>
        cellLayout.contentHeight
    )
  );

  const minHeight =
    props.showFullName
      ? TABLE.minFullRowHeight
      : TABLE.minCompactRowHeight;

  const requiredHeight =
    maxContentHeight +
    TABLE.cellPaddingY * 2;

  return {
    key:
      row?.key ??
      row?.index ??
      `row-${rowIndex}`,

    row,

    index:
      row?.index ??
      rowIndex + 1,

    cells,

    height: Math.max(
      minHeight,
      requiredHeight
    ),
  };
}

function createTableLayout(ctx) {
  const width =
    TABLE.indexWidth +
    tableParts.value.length *
      TABLE.cellWidth;

  const header =
    createHeaderLayout(ctx);

  const rows =
    tableRows.value.map(
      (row, rowIndex) => {
        return createRowLayout(
          ctx,
          row,
          rowIndex
        );
      }
    );

  const height =
    header.height +
    rows.reduce(
      (total, rowLayout) => {
        return (
          total +
          rowLayout.height
        );
      },
      0
    );

  return {
    width,
    height,
    header,
    rows,
  };
}

function getCanvasNode() {
  if (canvasNode && canvasContext) {
    return Promise.resolve({
      canvas: canvasNode,
      ctx: canvasContext,
    });
  }

  return new Promise((resolve, reject) => {
    uni.createSelectorQuery()
      .in(proxy)
      .select('#previewEntryCanvas')
      .fields({
        node: true,
        size: true,
      })
      .exec((result) => {
        const canvasInfo =
          result && result[0];

        if (
          !canvasInfo ||
          !canvasInfo.node
        ) {
          reject(
            new Error(
              '未获取到 Canvas 2D 节点'
            )
          );
          return;
        }

        canvasNode = canvasInfo.node;
        canvasContext =
          canvasNode.getContext('2d');

        resolve({
          canvas: canvasNode,
          ctx: canvasContext,
        });
      });
  });
}

function resizeCanvas(
  canvas,
  width,
  height
) {
  canvas.width = Math.max(
    1,
    Math.ceil(width)
  );

  canvas.height = Math.max(
    1,
    Math.ceil(height)
  );

  canvasWidth.value =
    canvas.width;

  canvasHeight.value =
    canvas.height;
}

async function rebuildLayout() {
  layoutReady.value = false;
  previewImagePath.value = '';

  await nextTick();

  try {
    const { ctx } =
      await getCanvasNode();

    tableLayout.value =
      createTableLayout(ctx);

    previewImagePath.value =
      await renderTableImage();

    await nextTick();
    await updatePreviewStageRect();
    resetPreviewTransform();
    layoutReady.value = true;
  } catch (error) {
    console.warn(
      '生成表格布局失败',
      error
    );

    tableLayout.value = {
      width: 1,
      height: 1,

      header: {
        height: 1,
        columns: [],
      },

      rows: [],
    };
  }
}

function isRemoteUrl(src) {
  return /^https?:\/\//i.test(
    String(src || '')
  );
}

function isLocalTempPath(src) {
  const path = String(src || '');

  return (
    path.startsWith('wxfile://') ||
    path.startsWith('http://tmp/') ||
    path.startsWith('https://tmp/') ||
    path.startsWith('file://') ||
    path.startsWith('_doc/') ||
    path.startsWith('_downloads/')
  );
}

/**
 * 下载一张线上图片并获得 Canvas 可绘制的本地临时路径。
 */
function downloadRemoteImage(src) {
  if (!src) {
    return Promise.resolve('');
  }

  const cachedPath =
    exportImageCache.get(src);

  if (cachedPath) {
    return Promise.resolve(
      cachedPath
    );
  }

  return new Promise((resolve) => {
    uni.downloadFile({
      url: src,
      timeout: 15000,

      success(downloadResult) {
        const statusCode = Number(
          downloadResult.statusCode
        );

        const tempFilePath =
          downloadResult.tempFilePath;

        if (
          statusCode < 200 ||
          statusCode >= 300 ||
          !tempFilePath
        ) {
          console.error(
            '远程图片下载失败：HTTP 状态异常',
            {
              src,
              statusCode,
              downloadResult,
            }
          );

          resolve('');
          return;
        }

        /*
         * 再调用一次 getImageInfo，
         * 确认下载结果确实是可读取的图片。
         */
        uni.getImageInfo({
          src: tempFilePath,

          success(imageInfo) {
            const drawablePath =
              imageInfo.path ||
              tempFilePath;

            exportImageCache.set(
              src,
              drawablePath
            );

            resolve(drawablePath);
          },

          fail(error) {
            console.error(
              '远程文件已下载，但无法作为图片读取',
              {
                src,
                tempFilePath,
                error,
              }
            );

            resolve('');
          },
        });
      },

      fail(error) {
        console.error(
          '远程图片下载失败',
          {
            src,
            error,
          }
        );

        resolve('');
      },
    });
  });
}

/**
 * 获取本地 static 图片的 Canvas 可绘制路径。
 */
function resolveLocalImage(src) {
  if (!src) {
    return Promise.resolve('');
  }

  if (isLocalTempPath(src)) {
    return Promise.resolve(src);
  }

  return new Promise((resolve) => {
    uni.getImageInfo({
      src,

      success(result) {
        /*
         * static 包内图片优先继续使用原始绝对路径。
         * 临时图片则使用 getImageInfo 返回路径。
         */
        if (
          String(src).startsWith(
            '/static/'
          )
        ) {
          resolve(src);
          return;
        }

        resolve(
          result.path || src
        );
      },

      fail(error) {
        console.error(
          '本地图片读取失败',
          {
            src,
            error,
          }
        );

        resolve('');
      },
    });
  });
}

/**
 * 将任意图片地址转换为 Canvas 可绘制路径。
 */
function resolveCanvasImage(src) {
  if (!src) {
    return Promise.resolve('');
  }

  if (isRemoteUrl(src)) {
    return downloadRemoteImage(src);
  }

  return resolveLocalImage(src);
}

/**
 * 加载所有导出图片。
 *
 * imageMap 的 key 仍然是原始线上 URL，
 * value 是下载后的微信本地临时路径。
 */
function createCanvasImage(
  canvas,
  src
) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image =
      canvas.createImage();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = (error) => {
      console.error(
        'Canvas 2D 图片加载失败',
        {
          src,
          error,
        }
      );

      resolve(null);
    };

    image.src = src;
  });
}

/**
 * 下载并加载所有导出图片。
 *
 * imageMap 的 key 是原始 URL，
 * value 是 Canvas 2D Image 对象。
 */
async function loadExportImages(
  canvas
) {
  const sources = new Set();

  tableLayout.value.rows.forEach(
    (rowLayout) => {
      rowLayout.cells.forEach(
        (cellLayout) => {
          if (cellLayout.logo) {
            sources.add(
              cellLayout.logo
            );
          }
        }
      );
    }
  );

  const items =
    await Promise.all(
      Array.from(sources).map(
        async (src) => {
          const drawablePath =
            await resolveCanvasImage(src);

          const image =
            drawablePath
              ? await createCanvasImage(
                  canvas,
                  drawablePath
                )
              : null;

          return [src, image];
        }
      )
    );

  const imageMap = {};

  items.forEach(
    ([src, image]) => {
      if (image) {
        imageMap[src] = image;
      }
    }
  );

  return imageMap;
}

function withClipRect(
  ctx,
  x,
  y,
  width,
  height,
  callback
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(
    x,
    y,
    width,
    height
  );
  ctx.clip();

  try {
    callback();
  } finally {
    ctx.restore();
  }
}

function drawTextLines(
  ctx,
  lines,
  x,
  y,
  lineHeight,
  align = 'left'
) {
  ctx.textAlign = align;
  ctx.textBaseline = 'top';

  lines.forEach(
    (line, lineIndex) => {
      ctx.fillText(
        line || ' ',
        x,
        y +
          lineIndex *
            lineHeight
      );
    }
  );
}

function drawTitleLines(
  ctx,
  lines,
  x,
  y,
  lineHeight
) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  lines.forEach(
    (line, lineIndex) => {
      ctx.fillText(
        line || ' ',
        x,
        y +
          lineIndex *
            lineHeight +
          lineHeight / 2
      );
    }
  );
}

function drawBackground(
  ctx,
  layout
) {
  ctx.fillStyle =
    COLORS.background;

  ctx.fillRect(
    0,
    0,
    layout.width,
    layout.height
  );
}

function drawHeader(
  ctx,
  layout
) {
  const header = layout.header;

  ctx.fillStyle =
    COLORS.headerBackground;

  ctx.fillRect(
    0,
    0,
    layout.width,
    header.height
  );

  ctx.fillStyle =
    COLORS.headerText;

  setCanvasFont(
    ctx,
    TABLE.headerFontSize,
    600
  );

  let left = 0;

  header.columns.forEach(
    (column) => {
      const textHeight =
        Math.max(
          1,
          column.lines.length
        ) *
        TABLE.headerLineHeight;

      const textTop =
        (header.height -
          textHeight) /
        2;

      withClipRect(
        ctx,
        left,
        0,
        column.width,
        header.height,
        () => {
          drawTextLines(
            ctx,
            column.lines,
            left +
              column.width / 2,
            textTop,
            TABLE.headerLineHeight,
            'center'
          );
        }
      );

      left += column.width;
    }
  );
}

function drawIndexCell(
  ctx,
  rowLayout,
  top
) {
  ctx.fillStyle =
    COLORS.indexText;

  setCanvasFont(
    ctx,
    TABLE.indexFontSize,
    600
  );

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  withClipRect(
    ctx,
    0,
    top,
    TABLE.indexWidth,
    rowLayout.height,
    () => {
      ctx.fillText(
        String(rowLayout.index),
        TABLE.indexWidth / 2,
        top +
          rowLayout.height / 2
      );
    }
  );
}

function drawEntryCell(
  ctx,
  cellLayout,
  left,
  top,
  rowHeight,
  imagePaths
) {
  if (!cellLayout.hasContent) {
    return;
  }

  withClipRect(
    ctx,
    left,
    top,
    TABLE.cellWidth,
    rowHeight,
    () => {
      const contentLeft =
        left +
        TABLE.cellPaddingX;

      const contentWidth =
        TABLE.cellWidth -
        TABLE.cellPaddingX * 2;

      const contentTop =
        top +
        Math.max(
          TABLE.cellPaddingY,
          (rowHeight -
            cellLayout.contentHeight) /
            2
        );

      /*
       * cellLayout.logo 是线上 URL。
       * imagePaths[线上 URL] 是下载后的本地路径。
       */
      const logoPath =
        cellLayout.logo
          ? imagePaths[
              cellLayout.logo
            ]
          : '';

      const hasLogo =
        Boolean(
          cellLayout.logo
        );

      const titleLeft =
        contentLeft +
        (hasLogo
          ? TABLE.logoSize +
            TABLE.logoGap
          : 0);

      const titleWidth =
        contentWidth -
        (hasLogo
          ? TABLE.logoSize +
            TABLE.logoGap
          : 0);

      if (logoPath) {
        try {
          ctx.drawImage(
            logoPath,
            contentLeft,
            contentTop,
            TABLE.logoSize,
            TABLE.logoSize
          );
        } catch (error) {
          console.error(
            'Canvas 绘制图标失败',
            {
              originalUrl:
                cellLayout.logo,
              logoPath,
              error,
            }
          );
        }
      }

      ctx.fillStyle =
        COLORS.primaryText;

      setCanvasFont(
        ctx,
        TABLE.titleFontSize,
        600
      );

      withClipRect(
        ctx,
        titleLeft,
        contentTop,
        Math.max(
          1,
          titleWidth
        ),
        cellLayout.titleBlockHeight,
        () => {
          drawTitleLines(
            ctx,
            cellLayout.titleLines,
            titleLeft,
            contentTop,
            TABLE.titleLineHeight
          );
        }
      );

      if (
        !cellLayout
          .descriptionLines
          .length
      ) {
        return;
      }

      const descriptionTop =
        contentTop +
        cellLayout.titleBlockHeight +
        TABLE.titleDescriptionGap;

      ctx.fillStyle =
        COLORS.secondaryText;

      setCanvasFont(
        ctx,
        TABLE.descriptionFontSize,
        400
      );

      withClipRect(
        ctx,
        contentLeft,
        descriptionTop,
        contentWidth,
        cellLayout.descriptionHeight,
        () => {
          drawTextLines(
            ctx,
            cellLayout.descriptionLines,
            contentLeft,
            descriptionTop,
            TABLE.descriptionLineHeight
          );
        }
      );
    }
  );
}

function drawRows(
  ctx,
  layout,
  imagePaths
) {
  let top =
    layout.header.height;

  layout.rows.forEach(
    (rowLayout) => {
      drawIndexCell(
        ctx,
        rowLayout,
        top
      );

      rowLayout.cells.forEach(
        (
          cellLayout,
          cellIndex
        ) => {
          const left =
            TABLE.indexWidth +
            cellIndex *
              TABLE.cellWidth;

          drawEntryCell(
            ctx,
            cellLayout,
            left,
            top,
            rowLayout.height,
            imagePaths
          );
        }
      );

      top += rowLayout.height;
    }
  );
}

function drawGrid(
  ctx,
  layout
) {
  ctx.strokeStyle =
    COLORS.border;

  ctx.lineWidth = 1;

  ctx.strokeRect(
    0,
    0,
    layout.width,
    layout.height
  );

  // 竖线
  ctx.beginPath();

  ctx.moveTo(
    TABLE.indexWidth,
    0
  );

  ctx.lineTo(
    TABLE.indexWidth,
    layout.height
  );

  tableParts.value.forEach(
    (part, index) => {
      const x =
        TABLE.indexWidth +
        (index + 1) *
          TABLE.cellWidth;

      ctx.moveTo(x, 0);
      ctx.lineTo(
        x,
        layout.height
      );
    }
  );

  ctx.stroke();

  // 横线
  ctx.beginPath();

  let y =
    layout.header.height;

  ctx.moveTo(0, y);
  ctx.lineTo(
    layout.width,
    y
  );

  layout.rows.forEach(
    (rowLayout) => {
      y += rowLayout.height;

      ctx.moveTo(0, y);
      ctx.lineTo(
        layout.width,
        y
      );
    }
  );

  ctx.stroke();
}

function drawExportTable(
  ctx,
  layout,
  imagePaths
) {
  drawBackground(
    ctx,
    layout
  );

  drawHeader(
    ctx,
    layout
  );

  drawRows(
    ctx,
    layout,
    imagePaths
  );

  drawGrid(
    ctx,
    layout
  );
}

function getExportScale(
  width,
  height
) {
  const systemInfo =
    getWindowMetrics();

  const preferredScale =
    Math.max(
      2,
      Number(
        systemInfo.pixelRatio
      ) || 1
    );

  const maxDimension = 8192;
  const maxPixels = 32000000;

  const dimensionScale =
    Math.min(
      maxDimension /
        Math.max(1, width),

      maxDimension /
        Math.max(1, height)
    );

  const pixelScale =
    Math.sqrt(
      maxPixels /
        Math.max(
          1,
          width * height
        )
    );

  return Math.max(
    0.1,
    Math.min(
      preferredScale,
      dimensionScale,
      pixelScale
    )
  );
}

function flushCanvas() {
  return new Promise((resolve) => {
    setTimeout(resolve, 30);
  });
}

function canvasToFile(
  canvas,
  width,
  height
) {
  return new Promise(
    (resolve, reject) => {
      uni.canvasToTempFilePath(
        {
          canvas,

          x: 0,
          y: 0,

          width,
          height,

          destWidth: width,
          destHeight: height,

          fileType: 'png',
          quality: 1,

          success(result) {
            resolve(
              result.tempFilePath
            );
          },

          fail(error) {
            reject(error);
          },
        },
        proxy
      );
    }
  );
}

function saveImageToAlbum(filePath) {
  return new Promise(
    (resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath,
        success: resolve,
        fail: reject,
      });
    }
  );
}

async function renderTableImage() {
  const layout = tableLayout.value;
  const { canvas } = await getCanvasNode();
  const imagePaths = await loadExportImages(canvas);
  const scale = getExportScale(
    layout.width,
    layout.height
  );
  const outputWidth = Math.max(
    1,
    Math.ceil(layout.width * scale)
  );
  const outputHeight = Math.max(
    1,
    Math.ceil(layout.height * scale)
  );

  resizeCanvas(
    canvas,
    outputWidth,
    outputHeight
  );
  await nextTick();

  canvasContext = canvas.getContext('2d');
  canvasContext.setTransform(
    scale,
    0,
    0,
    scale,
    0,
    0
  );
  drawExportTable(
    canvasContext,
    layout,
    imagePaths
  );
  await flushCanvas();

  return canvasToFile(
    canvas,
    outputWidth,
    outputHeight
  );
}

async function download() {
  if (
    downloading.value ||
    !layoutReady.value
  ) {
    return;
  }

  if (!tableParts.value.length) {
    uni.showToast({
      title: '暂无可导出的表格列',
      icon: 'none',
    });

    return;
  }

  downloading.value = true;

  try {
    const filePath =
      previewImagePath.value ||
      await renderTableImage();

    await saveImageToAlbum(
      filePath
    );

    uni.showToast({
      title: '图片已保存',
      icon: 'none',
    });
  } catch (error) {
    console.warn(
      '保存装备词条预览图片失败',
      error
    );

    uni.showToast({
      title:
        '下载图片失败，请检查网络、域名及相册权限',
      icon: 'none',
    });
  } finally {
    downloading.value = false;
  }
}

watch(
  [
    () => props.modelValue,
    () => props.parts,
    () => props.rows,
    () => props.showFullName,
  ],
  async ([visible]) => {
    if (visible) {
      updatePreviewViewport();
      await rebuildLayout();
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

let keydownHandler;

onMounted(async () => {
  updatePreviewViewport();
  await rebuildLayout();

  // #ifdef H5
  keydownHandler = (event) => {
    if (
      event.key === 'Escape' &&
      props.modelValue
    ) {
      close();
    }
  };

  window.addEventListener(
    'keydown',
    keydownHandler
  );
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  // #endif
});

onBeforeUnmount(() => {
  exportImageCache.clear();
  canvasNode = null;
  canvasContext = null;

  // #ifdef H5
  if (keydownHandler) {
    window.removeEventListener(
      'keydown',
      keydownHandler
    );
  }
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  // #endif
});
</script>

<style lang="scss" scoped>
.table-preview-modal {
  display: flex;
  width: 98vw;
  height: 94vh;
  max-width: 1500px;
  max-height: 94vh;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18rpx;
  background: #f8fbff;
  box-shadow:
    0 26rpx 70rpx
    rgba(15, 23, 42, 0.24);
}

.preview-head {
  display: flex;
  min-height: 88rpx;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 0 22rpx;
  border-bottom:
    1rpx solid #e5edf7;
  background: #ffffff;
  color: #172033;
  font-size: 30rpx;
  font-weight: 900;
  box-sizing: border-box;
}

.preview-close,
.preview-tool {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  box-sizing: border-box;
}

.preview-close::after,
.preview-tool::after {
  border: 0;
}

.preview-close {
  min-width: 104rpx;
  height: 58rpx;
  padding: 0 20rpx;
  border-radius: 14rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 58rpx;
}

.preview-close:active,
.preview-tool:active {
  transform: scale(0.96);
}

.preview-unsaved-warning {
  flex: 0 0 auto;
  margin: 14rpx 18rpx 0;
  padding: 12rpx 16rpx;
  border: 1rpx solid rgba(251, 191, 36, .36);
  border-radius: 16rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(255, 247, 214, .54)),
    rgba(255, 245, 204, .58);
  color: #9a5a05;
  font-size: 23rpx;
  font-weight: 800;
  line-height: 1.4;
  box-sizing: border-box;
}

.preview-stage {
  position: relative;
  display: block;
  flex: 0 0 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #edf3fb;
  box-sizing: border-box;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.preview-stage:active {
  cursor: grabbing;
}

.preview-image-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  will-change: transform;
}

.preview-canvas-image {
  display: block;
  flex: none;
  pointer-events: none;
}

.preview-loading {
  display: flex;
  min-height: 300rpx;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 24rpx;
}

.preview-floating-tools {
  position: absolute;
  z-index: 3;
  top: 18rpx;
  right: 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx;
  border: 1rpx solid rgba(255, 255, 255, .72);
  border-radius: 18rpx;
  background: rgba(255, 255, 255, .88);
  box-shadow: 0 8rpx 28rpx rgba(15, 23, 42, .18);
  backdrop-filter: blur(12px);
}

.preview-tool {
  width: 64rpx;
  min-width: 64rpx;
  height: 64rpx;
  padding: 0;
  border-radius: 14rpx;
  background: #f1f6fd;
  color: #3d5875;
  line-height: 64rpx;
  transition:
    transform 0.12s ease,
    opacity 0.12s ease;
}

.preview-tool.download {
  background: #e8f4ff;
  color: #1769e0;
}

.preview-tool.disabled {
  opacity: 0.42;
}

.preview-entry-canvas {
  position: fixed;
  top: -99999px;
  left: -99999px;
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 480px) {
  .table-preview-modal {
    width: 98vw;
    height: 94vh;
    border-radius: 16rpx;
  }
}
</style>
