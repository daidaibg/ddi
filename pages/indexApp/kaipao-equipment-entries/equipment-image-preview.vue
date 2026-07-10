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
          aria-label="关闭表格预览"
          :disabled="downloading"
          @tap="close"
        >
          <u-icon
            name="close"
            size="32"
            color="#475569"
          />
        </button>
      </view>

      <scroll-view
        class="preview-table-scroll"
        scroll-x
        scroll-y
        :show-scrollbar="true"
      >
        <view
          v-if="layoutReady"
          class="preview-table"
          :style="previewTableStyle"
        >
          <!-- 表头 -->
          <view
            class="preview-row preview-header"
            :style="getRowStyle(tableLayout.header.height)"
          >
            <view
              v-for="column in tableLayout.header.columns"
              :key="column.key"
              class="preview-cell preview-header-cell"
              :class="{
                'index-cell': column.isIndex,
                'part-cell': !column.isIndex,
              }"
              :style="getCellStyle(
                column.width,
                tableLayout.header.height
              )"
            >
              <view class="line-list header-line-list">
                <text
                  v-for="(line, lineIndex) in column.lines"
                  :key="lineIndex"
                  class="text-line header-text-line"
                  :style="{
                    height: `${TABLE.headerLineHeight}px`,
                    lineHeight: `${TABLE.headerLineHeight}px`,
                    fontSize: `${TABLE.headerFontSize}px`,
                  }"
                >
                  {{ line || ' ' }}
                </text>
              </view>
            </view>
          </view>

          <!-- 数据行 -->
          <view
            v-for="rowLayout in tableLayout.rows"
            :key="rowLayout.key"
            class="preview-row"
            :style="getRowStyle(rowLayout.height)"
          >
            <!-- 序号 -->
            <view
              class="preview-cell index-cell"
              :style="getCellStyle(
                TABLE.indexWidth,
                rowLayout.height
              )"
            >
              <text
                class="index-text"
                :style="{
                  fontSize: `${TABLE.indexFontSize}px`,
                }"
              >
                {{ rowLayout.index }}
              </text>
            </view>

            <!-- 普通内容列 -->
            <view
              v-for="cellLayout in rowLayout.cells"
              :key="cellLayout.key"
              class="preview-cell part-cell"
              :style="getCellStyle(
                TABLE.cellWidth,
                rowLayout.height
              )"
            >
              <view
                v-if="cellLayout.hasContent"
                class="entry-content"
                :style="{
                  height: `${cellLayout.contentHeight}px`,
                }"
              >
                <!-- 标题区域 -->
                <view
                  class="entry-title-block"
                  :style="{
                    height: `${cellLayout.titleBlockHeight}px`,
                    minHeight: `${cellLayout.titleBlockHeight}px`,
                  }"
                >
                  <image
                    v-if="cellLayout.logo"
                    class="entry-logo"
                    :src="cellLayout.logo"
                    mode="aspectFit"
                    :style="{
                      width: `${TABLE.logoSize}px`,
                      height: `${TABLE.logoSize}px`,
                      minWidth: `${TABLE.logoSize}px`,
                      maxWidth: `${TABLE.logoSize}px`,
                      flexBasis: `${TABLE.logoSize}px`,
                      marginRight: `${TABLE.logoGap}px`,
                    }"
                  />

                  <view class="line-list title-line-list">
                    <text
                      v-for="(line, lineIndex) in cellLayout.titleLines"
                      :key="lineIndex"
                      class="text-line title-text-line"
                      :style="{
                        height: `${TABLE.titleLineHeight}px`,
                        lineHeight: `${TABLE.titleLineHeight}px`,
                        fontSize: `${TABLE.titleFontSize}px`,
                      }"
                    >
                      {{ line || ' ' }}
                    </text>
                  </view>
                </view>

                <!-- 描述区域 -->
                <view
                  v-if="cellLayout.descriptionLines.length"
                  class="line-list description-line-list"
                  :style="{
                    marginTop: `${TABLE.titleDescriptionGap}px`,
                    height: `${cellLayout.descriptionHeight}px`,
                  }"
                >
                  <text
                    v-for="(
                      line,
                      lineIndex
                    ) in cellLayout.descriptionLines"
                    :key="lineIndex"
                    class="text-line description-text-line"
                    :style="{
                      height: `${TABLE.descriptionLineHeight}px`,
                      lineHeight: `${TABLE.descriptionLineHeight}px`,
                      fontSize: `${TABLE.descriptionFontSize}px`,
                    }"
                  >
                    {{ line || ' ' }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view
          v-else
          class="preview-loading"
        >
          正在生成表格预览
        </view>
      </scroll-view>

      <view class="preview-toolbar">
        <button
          class="preview-tool download"
          aria-label="下载图片"
          :loading="downloading"
          :disabled="downloading || !layoutReady"
          @tap="download"
        >
          <u-icon
            name="download"
            size="28"
            color="currentColor"
          />

          <text>
            {{ downloading ? '下载中' : '下载图片' }}
          </text>
        </button>

        <button
          class="preview-tool"
          aria-label="关闭表格预览"
          :disabled="downloading"
          @tap="close"
        >
          <u-icon
            name="close"
            size="28"
            color="currentColor"
          />

          <text>关闭</text>
        </button>
      </view>
    </view>
  </u-popup>

  <!-- 测量和导出共用 Canvas -->
  <canvas
    canvas-id="previewEntryCanvas"
    class="preview-entry-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
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
 * 所有配置先以 rpx 定义。
 *
 * 初始化时统一转换成 px。
 * 预览和 Canvas 导出都使用同一套 px 尺寸。
 */
const TABLE_RPX = {
  outerPadding: 16,

  indexWidth: 108,
  cellWidth: 380,

  minHeaderHeight: 76,
  minCompactRowHeight: 104,
  minFullRowHeight: 156,

  /**
   * 左右使用完全相同的内边距。
   */
  cellPaddingX: 16,
  cellPaddingY: 16,

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

  /**
   * 只增加垂直安全距离，
   * 不再从可用文字宽度中额外减值。
   */
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

const seasonLogoMap = {
  G1: '/static/img/kaipao/G/logo/G1.png',
  G2: '/static/img/kaipao/G/logo/G2.png',
  G3: '/static/img/kaipao/G/logo/G3.png',
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
});

const emit = defineEmits([
  'update:modelValue',
]);

const { proxy } = getCurrentInstance();

const downloading = ref(false);
const layoutReady = ref(false);

const canvasWidth = ref(1);
const canvasHeight = ref(1);

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

const TABLE = reactive(
  Object.fromEntries(
    Object.entries(TABLE_RPX).map(
      ([key, value]) => {
        return [
          key,
          rpxToPx(value),
        ];
      }
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

const previewTableStyle = computed(() => {
  const fullWidth =
    tableLayout.value.width +
    TABLE.outerPadding * 2;

  return {
    width: `${fullWidth}px`,
    minWidth: `${fullWidth}px`,
    maxWidth: `${fullWidth}px`,
    padding: `${TABLE.outerPadding}px`,
  };
});

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

function getRowStyle(height) {
  const width = tableLayout.value.width;

  return {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,

    height: `${height}px`,
    minHeight: `${height}px`,
    maxHeight: `${height}px`,
  };
}

function getCellStyle(width, height) {
  return {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,

    flexBasis: `${width}px`,

    height: `${height}px`,
    minHeight: `${height}px`,
    maxHeight: `${height}px`,

    /**
     * 左右内边距完全相同。
     */
    padding:
      `${TABLE.cellPaddingY}px ` +
      `${TABLE.cellPaddingX}px`,
  };
}

/**
 * 设置 Canvas 字体。
 */
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
    // 兼容旧版小程序 CanvasContext。
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
 * 使用 Canvas 真实宽度计算换行。
 *
 * 不再额外扣除右侧安全宽度，
 * 避免文字提前换行造成右侧空白较大。
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

/**
 * 表头布局。
 */
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

/**
 * 单元格布局。
 */
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

  /**
   * 单元格内部的完整可用宽度。
   * 左右内边距严格相等。
   */
  const contentWidth =
    TABLE.cellWidth -
    TABLE.cellPaddingX * 2;

  /**
   * 标题图标存在时，只从标题文字区域
   * 中扣除图标和间距。
   */
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

    /**
     * 描述使用整个内容区域宽度。
     */
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

/**
 * 数据行布局。
 */
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

/**
 * 完整表格布局。
 */
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

async function rebuildLayout() {
  layoutReady.value = false;

  await nextTick();

  try {
    const measureContext =
      uni.createCanvasContext(
        'previewEntryCanvas',
        proxy
      );

    tableLayout.value =
      createTableLayout(
        measureContext
      );

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

/**
 * 加载导出图片。
 */
function loadExportImages() {
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

  return Promise.all(
    Array.from(sources).map(
      (src) => {
        return new Promise(
          (resolve) => {
            uni.getImageInfo({
              src,

              success() {
                /**
                 * 使用原始 /static 路径，
                 * 避免 res.path 变成相对路径。
                 */
                resolve([
                  src,
                  src,
                ]);
              },

              fail(error) {
                console.warn(
                  '加载导出图片失败',
                  src,
                  error
                );

                resolve([
                  src,
                  '',
                ]);
              },
            });
          }
        );
      }
    )
  ).then((items) => {
    return items.reduce(
      (
        imageMap,
        [src, path]
      ) => {
        if (path) {
          imageMap[src] = path;
        }

        return imageMap;
      },
      {}
    );
  });
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
  ctx.setTextAlign(align);
  ctx.setTextBaseline('top');

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

/**
 * 标题第一行中心与图标中心对齐。
 */
function drawTitleLines(
  ctx,
  lines,
  x,
  y,
  lineHeight
) {
  ctx.setTextAlign('left');
  ctx.setTextBaseline('middle');

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
  ctx.setFillStyle(
    COLORS.background
  );

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

  ctx.setFillStyle(
    COLORS.headerBackground
  );

  ctx.fillRect(
    0,
    0,
    layout.width,
    header.height
  );

  ctx.setFillStyle(
    COLORS.headerText
  );

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
  ctx.setFillStyle(
    COLORS.indexText
  );

  setCanvasFont(
    ctx,
    TABLE.indexFontSize,
    600
  );

  ctx.setTextAlign('center');
  ctx.setTextBaseline('middle');

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
      /**
       * 左侧起点严格等于左内边距。
       */
      const contentLeft =
        left +
        TABLE.cellPaddingX;

      /**
       * 右侧终点严格等于：
       * left + cellWidth - cellPaddingX。
       */
      const contentWidth =
        TABLE.cellWidth -
        TABLE.cellPaddingX * 2;

      /**
       * 整个内容块在单元格中垂直居中。
       */
      const contentTop =
        top +
        Math.max(
          TABLE.cellPaddingY,
          (rowHeight -
            cellLayout.contentHeight) /
            2
        );

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
        ctx.drawImage(
          logoPath,
          contentLeft,
          contentTop,
          TABLE.logoSize,
          TABLE.logoSize
        );
      }

      ctx.setFillStyle(
        COLORS.primaryText
      );

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

      ctx.setFillStyle(
        COLORS.secondaryText
      );

      setCanvasFont(
        ctx,
        TABLE.descriptionFontSize,
        400
      );

      /**
       * 描述使用完整 contentWidth，
       * 左右间距严格相等。
       */
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

      top +=
        rowLayout.height;
    }
  );
}

function drawGrid(
  ctx,
  layout
) {
  ctx.setStrokeStyle(
    COLORS.border
  );

  ctx.setLineWidth(1);

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
      y +=
        rowLayout.height;

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
    uni.getSystemInfoSync();

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

function flushCanvas(ctx) {
  return new Promise((resolve) => {
    ctx.draw(
      false,
      resolve
    );
  });
}

function canvasToFile(
  width,
  height
) {
  return new Promise(
    (resolve, reject) => {
      uni.canvasToTempFilePath(
        {
          canvasId:
            'previewEntryCanvas',

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
    const layout =
      tableLayout.value;

    const scale =
      getExportScale(
        layout.width,
        layout.height
      );

    const outputWidth =
      Math.max(
        1,
        Math.ceil(
          layout.width *
            scale
        )
      );

    const outputHeight =
      Math.max(
        1,
        Math.ceil(
          layout.height *
            scale
        )
      );

    canvasWidth.value =
      outputWidth;

    canvasHeight.value =
      outputHeight;

    await nextTick();

    const imagePaths =
      await loadExportImages();

    const ctx =
      uni.createCanvasContext(
        'previewEntryCanvas',
        proxy
      );

    ctx.scale(
      scale,
      scale
    );

    drawExportTable(
      ctx,
      layout,
      imagePaths
    );

    await flushCanvas(ctx);

    const filePath =
      await canvasToFile(
        outputWidth,
        outputHeight
      );

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
        '下载图片失败，请检查相册权限',
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
  // #endif
});

onBeforeUnmount(() => {
  // #ifdef H5
  if (keydownHandler) {
    window.removeEventListener(
      'keydown',
      keydownHandler
    );
  }
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
  width: 58rpx;
  height: 58rpx;
  padding: 0;
  border-radius: 14rpx;
  background: #f1f5f9;
}

.preview-close:active,
.preview-tool:active {
  transform: scale(0.96);
}

.preview-table-scroll {
  flex: 1 1 auto;
  min-height: 0;
  background: #edf3fb;
  box-sizing: border-box;
}

.preview-loading {
  display: flex;
  min-height: 300rpx;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 24rpx;
}

.preview-table {
  display: inline-flex;
  flex-direction: column;
  box-sizing: border-box;
}

.preview-row {
  display: flex;
  flex: 0 0 auto;
  align-items: stretch;
  box-sizing: border-box;
}

.preview-cell {
  display: flex;
  min-width: 0;
  flex-grow: 0;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;

  border-right:
    1px solid #dbe5f2;

  border-bottom:
    1px solid #dbe5f2;

  background: #ffffff;
  color: #172033;
  box-sizing: border-box;
}

.preview-row:first-child
.preview-cell {
  border-top:
    1px solid #dbe5f2;
}

.preview-cell:first-child {
  border-left:
    1px solid #dbe5f2;
}

.preview-header-cell {
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
  color: #1769e0;
  font-weight: 600;
  text-align: center;
}

.index-cell {
  align-items: center;
  justify-content: center;
  color: #1769e0;
  font-weight: 600;
  text-align: center;
}

.index-text {
  display: block;
  width: 100%;
  text-align: center;
  white-space: nowrap;
}

.entry-content {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  align-self: stretch;
  flex: 0 0 auto;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
}

.entry-title-block {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  box-sizing: border-box;
}

.entry-logo {
  flex-grow: 0;
  flex-shrink: 0;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 0;
}

.line-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  box-sizing: border-box;
}

.header-line-list {
  width: 100%;
  max-width: 100%;
  align-items: center;
  text-align: center;
}

.title-line-list {
  width: 0;
  min-width: 0;
  max-width: none;
  flex: 1 1 0;
  color: #172033;
  font-weight: 600;
}

.description-line-list {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  align-self: stretch;
  color: #64748b;
  font-weight: 400;
}

.text-line {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: visible;

  /*
   * 文字已经由 Canvas 统一拆行。
   * 禁止预览层进行第二次换行。
   */
  white-space: nowrap;
  word-break: normal;
  overflow-wrap: normal;

  font-family:
    "PingFang SC",
    "Microsoft YaHei",
    Arial,
    sans-serif;

  box-sizing: border-box;
}

.header-text-line {
  text-align: center;
  font-weight: 600;
}

.title-text-line {
  text-align: left;
  font-weight: 600;
}

.description-text-line {
  text-align: left;
  font-weight: 400;
}

.preview-toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;

  padding:
    14rpx
    16rpx
    calc(
      14rpx +
      env(safe-area-inset-bottom)
    );

  border-top:
    1rpx solid #e5edf7;

  background: #ffffff;
  box-sizing: border-box;
}

.preview-tool {
  min-width: 136rpx;
  height: 58rpx;
  gap: 6rpx;
  padding: 0 16rpx;
  border-radius: 14rpx;
  background: #f1f6fd;
  color: #3d5875;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 58rpx;
  transition:
    transform 0.12s ease,
    opacity 0.12s ease;
}

.preview-tool.download {
  background: #e8f4ff;
  color: #1769e0;
}

.preview-tool[disabled] {
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
    height: 95vh;
    border-radius: 16rpx;
  }
}
</style>