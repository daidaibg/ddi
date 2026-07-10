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
          class="preview-table"
          :style="previewTableStyle"
        >
          <!-- 表头 -->
          <view
            class="preview-row preview-header"
            :style="previewRowStyle"
          >
            <view class="preview-cell index-cell header-cell">
              <text class="header-text">序号</text>
            </view>

            <view
              v-for="(part, partIndex) in tableParts"
              :key="part.key ?? partIndex"
              class="preview-cell part-cell header-cell"
            >
              <text class="header-text">
                {{ part.label }}
              </text>
            </view>
          </view>

          <!-- 数据 -->
          <view
            v-for="(row, rowIndex) in tableRows"
            :key="row.key ?? row.index ?? rowIndex"
            class="preview-row data-row"
            :style="previewRowStyle"
          >
            <view class="preview-cell index-cell">
              <text class="index-text">
                {{ row.index ?? rowIndex + 1 }}
              </text>
            </view>

            <view
              v-for="(part, cellIndex) in tableParts"
              :key="part.key ?? cellIndex"
              class="preview-cell part-cell"
            >
              <view
                v-if="getRowCell(row, cellIndex).displayName"
                class="entry-content"
              >
                <view class="entry-title-row">
                  <image
                    v-if="
                      getSeasonLogo(
                        getRowCell(row, cellIndex).season
                      )
                    "
                    class="entry-logo"
                    :src="
                      getSeasonLogo(
                        getRowCell(row, cellIndex).season
                      )
                    "
                    mode="aspectFit"
                  />

                  <text class="entry-title">
                    {{
                      getRowCell(row, cellIndex).displayName
                    }}
                  </text>
                </view>

                <text
                  v-if="
                    showFullName &&
                    getRowCell(row, cellIndex).name
                  "
                  class="entry-description"
                >
                  {{ getRowCell(row, cellIndex).name }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="preview-toolbar">
        <button
          class="preview-tool download"
          aria-label="下载图片"
          :loading="downloading"
          :disabled="downloading"
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

  <!-- 导出用隐藏 Canvas -->
  <canvas
    canvas-id="previewEntryCanvas"
    class="preview-entry-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    :style="{
      width: canvasWidth + 'px',
      height: canvasHeight + 'px',
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
  ref,
} from 'vue';

/**
 * 预览和导出使用同一套逻辑尺寸。
 *
 * 预览中按 rpx 使用；
 * Canvas 导出中按逻辑 px 使用。
 */
const TABLE = {
  outerPadding: 16,

  indexWidth: 108,

  // 增加普通列宽
  cellWidth: 360,

  minHeaderHeight: 76,
  minCompactRowHeight: 104,
  minFullRowHeight: 156,

  cellPaddingX: 20,
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

  // 防止 Canvas 字体底部被裁切
  textBottomSafety: 4,
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
const canvasWidth = ref(1);
const canvasHeight = ref(1);

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

const tableLogicalWidth = computed(() => {
  return (
    TABLE.indexWidth +
    tableParts.value.length * TABLE.cellWidth
  );
});

const previewTableStyle = computed(() => {
  const width =
    tableLogicalWidth.value +
    TABLE.outerPadding * 2;

  return {
    width: `${width}rpx`,
    minWidth: `${width}rpx`,
    padding: `${TABLE.outerPadding}rpx`,
  };
});

const previewRowStyle = computed(() => {
  return {
    width: `${tableLogicalWidth.value}rpx`,
    minWidth: `${tableLogicalWidth.value}rpx`,
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

/**
 * 获取 Canvas 文字真实宽度。
 */
function measureTextWidth(ctx, text) {
  const value = String(text ?? '');

  if (!value) return 0;

  const result = ctx.measureText(value);

  return Number(result?.width) || 0;
}

/**
 * 按 Canvas 的真实文字宽度拆行。
 *
 * 不截断，不添加省略号。
 */
function wrapCanvasText(
  ctx,
  text,
  maxWidth,
) {
  const value = String(text ?? '');

  if (!value || maxWidth <= 0) {
    return [];
  }

  const paragraphs = value.split(/\r?\n/);
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
              ) > maxWidth
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

  return lines;
}

/**
 * 计算表头布局。
 */
function createHeaderLayout(ctx) {
  ctx.setFontSize(
    TABLE.headerFontSize
  );

  const columns = [
    {
      key: '__index__',
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

  const maximumLineCount = Math.max(
    1,
    ...columns.map((column) => {
      return Math.max(
        1,
        column.lines.length
      );
    })
  );

  const requiredHeight =
    maximumLineCount *
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
 * 计算单个内容单元格布局。
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

  const titleWidth =
    TABLE.cellWidth -
    TABLE.cellPaddingX * 2 -
    (logo
      ? TABLE.logoSize +
        TABLE.logoGap
      : 0);

  ctx.setFontSize(
    TABLE.titleFontSize
  );

  const titleLines = wrapCanvasText(
    ctx,
    displayName,
    Math.max(1, titleWidth)
  );

  const titleTextHeight =
    Math.max(
      1,
      titleLines.length
    ) *
      TABLE.titleLineHeight +
    TABLE.textBottomSafety;

  const titleBlockHeight = Math.max(
    logo ? TABLE.logoSize : 0,
    titleTextHeight
  );

  let descriptionLines = [];

  if (
    props.showFullName &&
    description
  ) {
    ctx.setFontSize(
      TABLE.descriptionFontSize
    );

    descriptionLines =
      wrapCanvasText(
        ctx,
        description,
        TABLE.cellWidth -
          TABLE.cellPaddingX * 2
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
 * 计算单行布局。
 *
 * 行高取该行所有单元格中的最大高度。
 */
function createRowLayout(
  ctx,
  row,
  rowIndex
) {
  const cells = tableParts.value.map(
    (part, cellIndex) => {
      return createCellLayout(
        ctx,
        row,
        cellIndex
      );
    }
  );

  const maximumContentHeight = Math.max(
    0,
    ...cells.map((cell) => {
      return cell.contentHeight;
    })
  );

  const minimumHeight =
    props.showFullName
      ? TABLE.minFullRowHeight
      : TABLE.minCompactRowHeight;

  const requiredHeight =
    maximumContentHeight +
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
      minimumHeight,
      requiredHeight
    ),
  };
}

/**
 * 根据真实 Canvas 字体宽度计算完整导出布局。
 */
function createExportLayout(ctx) {
  const width =
    tableLogicalWidth.value;

  const header =
    createHeaderLayout(ctx);

  const rows = tableRows.value.map(
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

/**
 * 加载导出图片。
 *
 * 包内 static 图片保留原始绝对路径。
 */
function loadExportImages() {
  const sources = new Set();

  tableRows.value.forEach((row) => {
    tableParts.value.forEach(
      (part, cellIndex) => {
        const cell = getRowCell(
          row,
          cellIndex
        );

        const logo =
          getSeasonLogo(cell.season);

        if (logo) {
          sources.add(logo);
        }
      }
    );
  });

  return Promise.all(
    Array.from(sources).map(
      (src) => {
        return new Promise(
          (resolve) => {
            uni.getImageInfo({
              src,

              success() {
                resolve([
                  src,
                  src,
                ]);
              },

              fail(error) {
                console.warn(
                  '加载导出图标失败',
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

/**
 * Canvas 裁剪区域。
 */
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

/**
 * 绘制普通多行文字。
 */
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
 * 绘制标题文字。
 *
 * 第一行文字中心与图标中心对齐。
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
  const header =
    layout.header;

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

  ctx.setFontSize(
    TABLE.headerFontSize
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
        Math.max(
          TABLE.cellPaddingY,
          (header.height -
            textHeight) /
            2
        );

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

  ctx.setFontSize(
    TABLE.indexFontSize
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

      const logoPath =
        cellLayout.logo
          ? imagePaths[
              cellLayout.logo
            ]
          : '';

      const hasLogo =
        Boolean(cellLayout.logo);

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

      ctx.setFontSize(
        TABLE.titleFontSize
      );

      withClipRect(
        ctx,
        titleLeft,
        contentTop,
        Math.max(1, titleWidth),
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

      ctx.setFontSize(
        TABLE.descriptionFontSize
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
  ctx.setStrokeStyle(
    COLORS.border
  );

  ctx.setLineWidth(1);

  // 外框
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

  // 网格最后绘制
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

  const preferredScale = Math.max(
    2,
    Number(
      systemInfo.pixelRatio
    ) || 1
  );

  const maxDimension = 8192;
  const maxPixels = 32000000;

  const dimensionScale = Math.min(
    maxDimension /
      Math.max(1, width),

    maxDimension /
      Math.max(1, height)
  );

  const pixelScale = Math.sqrt(
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
  if (downloading.value) {
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
    /*
     * 创建一个测量上下文。
     * 使用真实 measureText 计算换行和行高。
     */
    const measureContext =
      uni.createCanvasContext(
        'previewEntryCanvas',
        proxy
      );

    const layout =
      createExportLayout(
        measureContext
      );

    const scale =
      getExportScale(
        layout.width,
        layout.height
      );

    const outputWidth = Math.max(
      1,
      Math.ceil(
        layout.width * scale
      )
    );

    const outputHeight = Math.max(
      1,
      Math.ceil(
        layout.height * scale
      )
    );

    canvasWidth.value =
      outputWidth;

    canvasHeight.value =
      outputHeight;

    await nextTick();

    const imagePaths =
      await loadExportImages();

    /*
     * Canvas 尺寸改变后重新创建上下文。
     */
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

let keydownHandler;

onMounted(() => {
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

/**
 * 关键：不再给数据行设置固定高度。
 *
 * 同一行中的 flex 单元格会自动拉伸到该行
 * 最高单元格的高度。
 */
.data-row {
  min-height: 156rpx;
}

.preview-cell {
  display: flex;
  min-width: 0;
  flex-grow: 0;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;

  padding:
    18rpx
    20rpx;

  border-right:
    1rpx solid #dbe5f2;

  border-bottom:
    1rpx solid #dbe5f2;

  background: #ffffff;
  color: #172033;
  box-sizing: border-box;
}

.preview-row:first-child
.preview-cell {
  border-top:
    1rpx solid #dbe5f2;
}

.preview-cell:first-child {
  border-left:
    1rpx solid #dbe5f2;
}

.index-cell {
  width: 108rpx;
  min-width: 108rpx;
  flex: 0 0 108rpx;
  align-items: center;
  justify-content: center;
  color: #1769e0;
  font-size: 23rpx;
  font-weight: 900;
  text-align: center;
}

.part-cell {
  width: 360rpx;
  min-width: 360rpx;
  flex: 0 0 360rpx;
}

.preview-header {
  min-height: 76rpx;
}

.header-cell {
  min-height: 76rpx;
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
  color: #1769e0;
  font-size: 25rpx;
  font-weight: 900;
  line-height: 36rpx;
  text-align: center;
}

.header-text {
  display: block;
  width: 100%;

  /*
   * 完整换行，不截断。
   */
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-all;
  text-align: center;
}

.index-text {
  display: block;
  width: 100%;
  text-align: center;
  white-space: normal;
}

.entry-content {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12rpx;
  box-sizing: border-box;
}

.entry-title-row {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: flex-start;
  gap: 12rpx;
  box-sizing: border-box;
}

.entry-logo {
  width: 36rpx;
  height: 36rpx;
  min-width: 36rpx;
  flex: 0 0 36rpx;
  margin: 0;
}

/**
 * 关键：
 * 不再人工拆成多个 nowrap 的 text。
 *
 * 直接由小程序文本组件按实际字体宽度换行。
 */
.entry-title {
  display: block;
  width: 0;
  min-width: 0;
  flex: 1 1 0;

  color: #172033;
  font-size: 23rpx;
  font-weight: 900;
  line-height: 34rpx;

  white-space: normal;
  overflow: visible;
  overflow-wrap: anywhere;
  word-break: break-all;
}

.entry-description {
  display: block;
  width: 100%;
  min-width: 0;

  color: #64748b;
  font-size: 20rpx;
  line-height: 30rpx;

  white-space: pre-wrap;
  overflow: visible;
  overflow-wrap: anywhere;
  word-break: break-all;
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