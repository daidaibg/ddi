<template>
  <view class="equipment-page">
    <view class="page-title">向僵尸开炮装备词条表</view>
    <view class="page-subtitle">本地配置优先，其次读取云端配置，最后使用默认配置。</view>

    <view v-if="openidLoading || openidError" class="openid-status" :class="{ error: openidError }">
      <text>{{ openidLoading ? 'openid 获取中...' : openidError }}</text>
      <button v-if="openidError && !openidLoading" class="openid-retry" @tap="retryGetOpenid">重新获取 openid</button>
    </view>

    <view class="toolbar-grid">
      <view class="toolbar-item detail-item">
        <u-icon name="eye" color="currentColor" size="30rpx"></u-icon>
        <text>详情</text>
        <u-switch v-model="state.showFullName" size="36" active-color="#1769e0"></u-switch>
      </view>
      <button class="toolbar-btn reset" @tap="resetRows">
        <u-icon name="trash" color="currentColor" size="30rpx"></u-icon>
        <text>清空</text>
      </button>
      <button class="toolbar-btn settings" @tap="openSettings">
        <u-icon name="setting" color="currentColor" size="30rpx"></u-icon>
        <text>设置</text>
      </button>
      <button class="toolbar-btn cloud" :disabled="state.syncing || openidLoading" @tap="useCloudConfig">
        <u-icon name="server-fill" color="currentColor" size="30rpx"></u-icon>
        <text>云端配置</text>
      </button>
      <button class="toolbar-btn export" @tap="previewImage">
        <u-icon name="photo" color="currentColor" size="30rpx"></u-icon>
        <text>预览图片</text>
      </button>
      <view class="edit-actions">
        <button v-if="state.isEditing" class="toolbar-btn cancel" :disabled="state.syncing" @tap="cancelEdit">
          <u-icon name="close" color="currentColor" size="28rpx"></u-icon>
          <text>取消</text>
        </button>
        <button class="toolbar-btn save" :disabled="state.syncing || openidLoading" @tap="handleEditSave">
          <u-icon :name="state.isEditing ? 'checkmark' : 'edit-pen'" color="currentColor" size="30rpx"></u-icon>
          <text>{{ state.isEditing ? '保存' : '编辑' }}</text>
        </button>
      </view>
    </view>

    <scroll-view class="part-tabs" scroll-x :show-scrollbar="false">
      <view class="part-tabs-inner">
        <button
          v-for="part in equipmentParts"
          :key="part.key"
          class="part-tab"
          :class="{ active: activePartKey === part.key }"
          @tap="activePartKey = part.key"
        >
          <image :src="partIconMap[part.key]" mode="aspectFit"></image>
          <text>{{ part.label }}</text>
        </button>
      </view>
    </scroll-view>

    <view class="entry-list">
      <view v-for="(row, rowIndex) in tableRows" :key="rowIndex" class="entry-card">
        <view class="entry-main">
          <text class="entry-index">#{{ rowIndex + 1 }}</text>
          <view
            v-if="state.isEditing"
            class="entry-picker"
            :class="{ selected: getEntry(row[activePart.key]), empty: !getEntry(row[activePart.key]) }"
            hover-class="entry-picker-hover"
            hover-stay-time="80"
            @tap="openEntryPicker(rowIndex)"
          >
            <view class="entry-title">
              <template v-if="getEntry(row[activePart.key])">
                <image v-if="getEntrySeasonLogo(getEntry(row[activePart.key]))" :src="getEntrySeasonLogo(getEntry(row[activePart.key]))" mode="aspectFit"></image>
                <text>{{ getEntryDisplayName(getEntry(row[activePart.key])) }}</text>
              </template>
              <text v-else class="entry-empty">未选择</text>
            </view>
            <view class="picker-chevron" :class="{ expanded: entryPopupVisible && activeRowIndex === rowIndex }">
              <u-icon name="arrow-down" size="30" color="#7b8fa8"></u-icon>
            </view>
          </view>
          <view v-else class="entry-title readonly">
            <template v-if="getEntry(row[activePart.key])">
              <image v-if="getEntrySeasonLogo(getEntry(row[activePart.key]))" :src="getEntrySeasonLogo(getEntry(row[activePart.key]))" mode="aspectFit"></image>
              <text>{{ getEntryDisplayName(getEntry(row[activePart.key])) }}</text>
            </template>
            <text v-else class="entry-empty">未选择</text>
          </view>
          <view v-if="state.isEditing" class="entry-actions">
            <button v-if="getEntry(row[activePart.key])" :disabled="rowIndex === 0" @tap.stop="moveEntry(rowIndex, activePart, -1)">↑</button>
            <button v-if="getEntry(row[activePart.key])" :disabled="rowIndex === tableRows.length - 1" @tap.stop="moveEntry(rowIndex, activePart, 1)">↓</button>
            <button class="danger" @tap.stop="removeRow(rowIndex)">删</button>
          </view>
        </view>
        <view v-if="state.showFullName && getEntry(row[activePart.key])" class="entry-desc">
          {{ getEntry(row[activePart.key]).name }}
        </view>
      </view>
    </view>

    <button v-if="state.isEditing" class="add-row-btn" @tap="addRow">新增一行</button>

    <u-popup v-model="entryPopupVisible" mode="bottom" border-radius="18" :safe-area-inset-bottom="true" :mask-close-able="true">
      <view class="popup-panel">
        <view class="popup-head">
          <text>{{ activePart.label }}词条</text>
          <button v-if="activeRow && activeRow[activePart.key]" class="link-btn" @tap="clearActiveEntry">清空</button>
        </view>
        <scroll-view class="option-scroll" scroll-y>
          <view
            v-for="entry in activeOptions"
            :key="entry.id"
            class="entry-option"
            :class="{ selected: activeRow && activeRow[activePart.key] === entry.id }"
            @tap="selectActiveEntry(entry.id)"
          >
            <view class="option-text">
              <view class="option-title">
                <image v-if="getEntrySeasonLogo(entry)" :src="getEntrySeasonLogo(entry)" mode="aspectFit"></image>
                <text>{{ getEntryDisplayName(entry) }}</text>
              </view>
              <text v-if="state.showFullName" class="option-desc">{{ entry.name }}</text>
            </view>
            <view class="option-actions">
              <text v-if="activeRow && activeRow[activePart.key] === entry.id" class="check-mark">✓</text>
              <button class="ignore-btn" @tap.stop="ignoreEntry(activePart, entry)">忽略</button>
            </view>
          </view>
          <view v-if="!activeOptions.length" class="empty-tip">暂无可选词条</view>
        </scroll-view>
      </view>
    </u-popup>

    <u-popup v-model="settingsVisible" mode="bottom" border-radius="18" :safe-area-inset-bottom="true" :mask-close-able="true">
      <view class="popup-panel settings-panel">
        <view class="popup-head">
          <text>忽略词条设置</text>
          <button class="link-btn" @tap="settingsVisible = false">完成</button>
        </view>
        <view class="settings-summary">当前部位：{{ activePart.label }}，已忽略 {{ ignoredEntryIdsByPart[activePart.key].length }} 条</view>
        <scroll-view class="option-scroll settings-scroll" scroll-y>
          <view
            v-for="entryId in ignoredEntryIdsByPart[activePart.key]"
            :key="entryId"
            class="ignored-option"
          >
            <text>{{ getEntryDisplayName(getEntry(entryId)) || entryId }}</text>
            <button @tap="restoreIgnoredEntry(activePart, entryId)">恢复</button>
          </view>
          <view v-if="!ignoredEntryIdsByPart[activePart.key].length" class="empty-tip">当前部位没有忽略词条</view>
        </scroll-view>
      </view>
    </u-popup>

    <equipment-image-preview
      v-model="previewVisible"
      :parts="previewParts"
      :rows="previewRows"
      :show-full-name="state.showFullName"
    ></equipment-image-preview>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, reactive, ref, watch } from 'vue';
import { onLoad ,onShareAppMessage} from '@dcloudio/uni-app';
import EquipmentImagePreview from './equipment-image-preview.vue';
import { equipmentEntryListByPart, equipmentEntryMap, equipmentParts } from './equipment-entry-data.js';
import {
  clearEquipmentEntryLocalConfig,
  cloneIgnoredEntryIds,
  createDefaultEquipmentEntryRows,
  createEmptyEquipmentEntryRow,
  createEmptyIgnoredEntryIds,
  createEquipmentEntryExportData,
  defaultSettings,
  hasEquipmentEntryLocalConfig,
  loadEquipmentEntryRows,
  loadEquipmentEntrySettings,
  normalizeEquipmentEntryRows,
  sanitizeIgnoredEntryIds,
  saveEquipmentEntryRows,
  saveEquipmentEntrySettings,
  OPENID_STORAGE_KEY,
  USER_SESSION_STORAGE_KEY,
} from './equipment-settings-storage.js';
import { baseVar } from '../../../util/http.js';

onShareAppMessage(() => ({ 
	title: '开炮装备词条',
	path: '/pages/indexApp/kaipao-equipment-entries/kaipao-equipment-entries'
}))

const seasonLogoMap = {
  G1: '/static/img/kaipao/G/logo/G1.png',
  G2: '/static/img/kaipao/G/logo/G2.png',
  G3: '/static/img/kaipao/G/logo/G3.png',
};

const partIconMap = {
  helmet: '/static/img/kaipao/equipment/toukui.png',
  clothes: '/static/img/kaipao/equipment/yifu.png',
  boots: '/static/img/kaipao/equipment/xiezi.png',
  bracer: '/static/img/kaipao/equipment/hubi.png',
  pants: '/static/img/kaipao/equipment/kuzi.png',
  gloves: '/static/img/kaipao/equipment/shoutao.png',
};

const toast = (title, icon = 'none') => uni.showToast({ title, icon });

const { proxy } = getCurrentInstance();
const tableRows = reactive(createDefaultEquipmentEntryRows());
const ignoredEntryIdsByPart = reactive(createEmptyIgnoredEntryIds());
const activePartKey = ref(equipmentParts[0].key);
const activeRowIndex = ref(-1);
const entryPopupVisible = ref(false);
const settingsVisible = ref(false);
const editSnapshot = ref(null);
const previewVisible = ref(false);
const openid = ref('');
const openidLoading = ref(false);
const openidError = ref('');
const state = reactive({
  isEditing: false,
  showFullName: true,
  syncing: false,
  suppressLocalSave: false,
  hasLocalConfig: false,
});

const activePart = computed(() => equipmentParts.find((part) => part.key === activePartKey.value) || equipmentParts[0]);
const activeRow = computed(() => tableRows[activeRowIndex.value] || null);
const selectedByPart = computed(() => equipmentParts.reduce((selectedMap, part) => {
  selectedMap[part.key] = tableRows.map((row) => row[part.key]).filter(Boolean);
  return selectedMap;
}, {}));
const activeOptions = computed(() => (activeRow.value ? getOptions(activePart.value, activeRow.value) : []));
const previewParts = computed(() => equipmentParts.map((part) => ({
  key: part.key,
  label: part.label,
})));
const previewRows = computed(() => tableRows.map((row, rowIndex) => ({
  index: rowIndex + 1,
  cells: equipmentParts.map((part) => {
    const entry = getEntry(row[part.key]);
    return {
      key: part.key,
      displayName: getEntryDisplayName(entry),
      name: (entry && entry.name) || '',
      season: (entry && entry.season) || '',
    };
  }),
})));

watch(tableRows, () => {
  if (!state.suppressLocalSave) saveToLocal();
}, { deep: true });
watch(ignoredEntryIdsByPart, () => {
  if (!state.suppressLocalSave) saveSettingsToLocal();
}, { deep: true });
watch(() => state.showFullName, () => {
  if (!state.suppressLocalSave) saveSettingsToLocal();
});

function getEntry(id) {
  return id ? equipmentEntryMap[id] : undefined;
}

function getEntryDisplayName(entry) {
  return (entry && (entry.shortName || entry.name)) || '';
}

function getEntrySeasonLogo(entry) {
  return entry && entry.season ? seasonLogoMap[entry.season] : '';
}

function getOptions(part, row) {
  const currentValue = row[part.key];
  const ignoredIds = ignoredEntryIdsByPart[part.key] || [];
  return equipmentEntryListByPart[part.key].filter((entry) => {
    if (ignoredIds.includes(entry.id)) return false;
    return entry.id === currentValue || !selectedByPart.value[part.key].includes(entry.id);
  });
}

function replaceRows(rows) {
  tableRows.splice(0, tableRows.length, ...rows);
}

function applyIgnoredEntryIds(settings) {
  const ignoredMap = sanitizeIgnoredEntryIds(settings);
  equipmentParts.forEach((part) => {
    ignoredEntryIdsByPart[part.key] = ignoredMap[part.key];
  });
}

function saveToLocal() {
  saveEquipmentEntryRows(tableRows);
  state.hasLocalConfig = true;
}

function createExportData() {
  return createEquipmentEntryExportData(tableRows, {
    ignoredEntryIdsByPart: cloneIgnoredEntryIds(ignoredEntryIdsByPart),
    showFullName: state.showFullName,
  });
}

function saveSettingsToLocal() {
  saveEquipmentEntrySettings(createExportData().settings);
  state.hasLocalConfig = true;
}

function loadLocalRows() {
  replaceRows(loadEquipmentEntryRows());
}

function loadLocalSettings() {
  const settings = loadEquipmentEntrySettings();
  applyIgnoredEntryIds(settings);
  state.showFullName = settings.showFullName;
}

function applyDefaultConfig() {
  replaceRows(createDefaultEquipmentEntryRows());
  applyIgnoredEntryIds(defaultSettings);
  state.showFullName = defaultSettings.showFullName;
}

function applyExportData(data = {}, persistLocal = true) {
  if (Array.isArray(data.rows)) {
    replaceRows(normalizeEquipmentEntryRows(data.rows));
  }
  applyIgnoredEntryIds(data.settings || {});
  if (typeof (data.settings || {}).showFullName === 'boolean') {
    state.showFullName = data.settings.showFullName;
  }
  if (persistLocal) {
    saveToLocal();
    saveSettingsToLocal();
  }
}

async function loadInitialConfig() {
  state.suppressLocalSave = true;
  state.hasLocalConfig = hasEquipmentEntryLocalConfig();
  try {
    if (state.hasLocalConfig) {
      loadLocalRows();
      loadLocalSettings();
      return;
    }
    if (openid.value) {
      const hasCloudConfig = await loadBackendData(true, '读取云端配置失败，已使用默认配置');
      state.hasLocalConfig = hasCloudConfig === true || hasEquipmentEntryLocalConfig();
      if (hasCloudConfig) return;
    }
    applyDefaultConfig();
  } finally {
    nextTick(() => {
      state.suppressLocalSave = false;
    });
  }
}

function getCachedOpenid() {
  const cachedOpenid = uni.getStorageSync(OPENID_STORAGE_KEY);
  if (cachedOpenid) return cachedOpenid;
  const legacySession = uni.getStorageSync(USER_SESSION_STORAGE_KEY);
  return (legacySession && legacySession.openid) || '';
}

function ensureOpenid(force = false) {
  if (!force) {
    const cachedOpenid = getCachedOpenid();
    if (cachedOpenid) {
      openid.value = cachedOpenid;
      openidError.value = '';
      return Promise.resolve(cachedOpenid);
    }
  }
  if (openidLoading.value) return Promise.resolve('');

  openidLoading.value = true;
  openidError.value = '';
  return new Promise((resolve) => {
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          openidError.value = '获取 openid 失败：未获取到微信登录 code';
          toast(openidError.value);
          openidLoading.value = false;
          resolve('');
          return;
        }
        proxy.$http({
          baseUrl: baseVar.baseUrl,
          url: '/auth/cs/user/wechat/mini-program/openid',
          method: 'post',
          data: { code: loginRes.code },
        }).then((res) => {
          const nextOpenid = res && res.data && res.data.openid;
          if (nextOpenid) {
            uni.setStorageSync(OPENID_STORAGE_KEY, nextOpenid);
            openid.value = nextOpenid;
            openidError.value = '';
            resolve(nextOpenid);
          } else {
            openid.value = '';
            openidError.value = (res && res.msg) || '获取 openid 失败，请重试';
            toast(openidError.value);
            resolve('');
          }
        }).catch((err) => {
          openid.value = '';
          openidError.value = (err && err.msg) || '获取 openid 失败，请重试';
          toast(openidError.value);
          resolve('');
        }).finally(() => {
          openidLoading.value = false;
        });
      },
      fail: () => {
        openid.value = '';
        openidError.value = '微信登录失败，请重试';
        openidLoading.value = false;
        toast(openidError.value);
        resolve('');
      },
    });
  });
}

function retryGetOpenid() {
  return ensureOpenid(true);
}

async function loadBackendData(persistLocal = true, warningMessage = '读取服务器保存数据失败，已使用本地缓存') {
  if (!openid.value || state.syncing) return false;
  state.syncing = true;
  try {
    const res = await proxy.$http({
      baseUrl: baseVar.baseUrl,
      url: '/blog/tool/zombie/saved-entry-ids',
      method: 'get',
      data: { openid: openid.value },
    });
    if (res && res.code === 200 && res.data) {
      applyExportData(res.data, persistLocal);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('读取向僵尸开炮装备词条接口失败', err);
    toast((err && err.msg) || warningMessage);
    return null;
  } finally {
    state.syncing = false;
  }
}

async function useCloudConfig() {
  await ensureOpenid();
  if (!openid.value || state.syncing) return;
  state.hasLocalConfig = false;
  state.suppressLocalSave = true;
  try {
    const hasCloudConfig = await loadBackendData(false, '读取云端配置失败，本地配置已清空');
    if (hasCloudConfig === null) return;
    if (!hasCloudConfig) applyDefaultConfig();
    clearEquipmentEntryLocalConfig();
    toast(hasCloudConfig ? '已切换为云端配置' : '本地配置已清空，暂无云端配置');
  } finally {
    state.suppressLocalSave = false;
  }
}

async function saveToBackend() {
  await ensureOpenid();
  if (!openid.value) return false;
  state.syncing = true;
  try {
    const res = await proxy.$http({
      baseUrl: baseVar.baseUrl,
      url: '/blog/tool/zombie/saved-entry-ids',
      method: 'post',
      data: { ...createExportData(), openid: openid.value },
    });
    if (res && res.code === 200) {
      toast('保存成功');
      return true;
    }
    toast((res && res.msg) || '保存失败');
    return false;
  } catch (err) {
    console.warn('保存向僵尸开炮装备词条接口失败', err);
    toast((err && err.msg) || '保存失败，请稍后再试');
    return false;
  } finally {
    state.syncing = false;
  }
}

async function handleEditSave() {
  if (!state.isEditing) {
    editSnapshot.value = createExportData();
    state.isEditing = true;
    return;
  }
  const isSaved = await saveToBackend();
  if (isSaved) {
    state.isEditing = false;
    entryPopupVisible.value = false;
    editSnapshot.value = null;
  }
}

function hasUnsavedEditChanges() {
  return !!editSnapshot.value && JSON.stringify(createExportData()) !== JSON.stringify(editSnapshot.value);
}

function finishCancelEdit() {
  if (editSnapshot.value) {
    state.suppressLocalSave = true;
    applyExportData(editSnapshot.value, true);
    nextTick(() => {
      state.suppressLocalSave = false;
    });
  }
  state.isEditing = false;
  entryPopupVisible.value = false;
  editSnapshot.value = null;
}

function cancelEdit() {
  if (!hasUnsavedEditChanges()) {
    finishCancelEdit();
    return;
  }
  uni.showModal({
    title: '取消编辑',
    content: '当前修改尚未保存，确定要取消吗？',
    success: (res) => {
      if (res.confirm) finishCancelEdit();
    },
  });
}

function openEntryPicker(rowIndex) {
  activeRowIndex.value = rowIndex;
  entryPopupVisible.value = true;
}

function selectActiveEntry(entryId) {
  if (!activeRow.value) return;
  activeRow.value[activePart.value.key] = entryId;
  entryPopupVisible.value = false;
}

function clearActiveEntry() {
  if (!activeRow.value) return;
  activeRow.value[activePart.value.key] = '';
  entryPopupVisible.value = false;
}

function ignoreEntry(part, entry) {
  const ignoredIds = ignoredEntryIdsByPart[part.key];
  if (ignoredIds.includes(entry.id)) return;
  ignoredEntryIdsByPart[part.key] = [...ignoredIds, entry.id];
  toast(`已忽略：${getEntryDisplayName(entry)}`);
}

function restoreIgnoredEntry(part, entryId) {
  ignoredEntryIdsByPart[part.key] = ignoredEntryIdsByPart[part.key].filter((id) => id !== entryId);
}

function openSettings() {
  settingsVisible.value = true;
}

function addRow() {
  tableRows.push(createEmptyEquipmentEntryRow());
}

function removeRow(index) {
  if (tableRows.length === 1) {
    tableRows.splice(0, 1, createEmptyEquipmentEntryRow());
    return;
  }
  tableRows.splice(index, 1);
}

function resetRows() {
  uni.showModal({
    title: '清空装备词条',
    content: '确定恢复默认空白行吗？',
    success: (res) => {
      if (res.confirm) replaceRows(createDefaultEquipmentEntryRows());
    },
  });
}

function moveEntry(rowIndex, part, direction) {
  const nextIndex = rowIndex + direction;
  if (nextIndex < 0 || nextIndex >= tableRows.length) return;
  const currentValue = tableRows[rowIndex][part.key];
  if (!currentValue) return;
  const nextValue = tableRows[nextIndex][part.key];
  tableRows[rowIndex][part.key] = nextValue;
  tableRows[nextIndex][part.key] = currentValue;
}

function previewImage() {
  previewVisible.value = true;
}

onLoad(async () => {
  await ensureOpenid();
  await loadInitialConfig();
});
</script>

<style lang="scss">
.equipment-page {
  min-height: 100vh;
  overflow-x: hidden;
  padding: 22rpx 18rpx 48rpx;
  background: #f4f7ff;
  color: #111827;
  box-sizing: border-box;
}

.page-title {
  font-size: 36rpx;
  font-weight: 900;
  line-height: 1.3;
}

.page-subtitle {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.45;
}


.openid-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 14rpx;
  padding: 14rpx 16rpx;
  border: 1rpx solid #bfdbfe;
  border-radius: 16rpx;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 24rpx;
  line-height: 1.35;
}

.openid-status.error {
  border-color: #fecaca;
  background: #fff1f2;
  color: #dc2626;
}

.openid-status text {
  flex: 1 1 auto;
  min-width: 0;
}

.openid-retry {
  flex: 0 0 auto;
  height: 48rpx;
  padding: 0 14rpx;
  border-radius: 12rpx;
  background: #ffffff;
  color: #1769e0;
  font-size: 23rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.openid-retry::after {
  border: 0;
}
.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8rpx;
  margin-top: 14rpx;
}

.toolbar-item,
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5rpx;
  height: 56rpx;
  border: 1rpx solid rgba(255, 255, 255, .82);
  border-radius: 12rpx;
  background: #fff;
  box-shadow: 0 5rpx 14rpx rgba(39, 76, 119, .08);
  color: #24394d;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  box-sizing: border-box;
}

.toolbar-btn::after {
  border: 0;
}

.detail-item {
  gap: 8rpx;
}

.reset { background: #fff7e8; }
.settings { background: #eaf6ff; }
.cloud { background: #f0efff; }
.export { background: #edfbea; }
.save { background: #e8f4ff; color: #17416e; }
.cancel { background: #f8fafc; color: #64748b; }

.edit-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4rpx;
  min-width: 0;
}

.edit-actions .toolbar-btn {
  width: 100%;
  min-width: 0;
  padding: 0;
}

.part-tabs {
  width: 100%;
  margin-top: 18rpx;
  white-space: nowrap;
}

.part-tabs-inner {
  display: inline-flex;
  gap: 12rpx;
  padding: 2rpx 2rpx 10rpx;
}

.part-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 62rpx;
  min-width: 120rpx;
  padding: 0 18rpx;
  border: 1rpx solid #dce5f2;
  border-radius: 16rpx;
  background: #fff;
  color: #536071;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 62rpx;
  box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, .06);
}

.part-tab::after { border: 0; }

.part-tab image {
  width: 38rpx;
  height: 38rpx;
  flex: 0 0 auto;
}

.part-tab.active {
  border-color: #1769e0;
  background: #eaf2ff;
  color: #1769e0;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 4rpx;
}

.entry-card {
  width: 100%;
  padding: 10rpx 12rpx;
  border: 1rpx solid #e3eaf5;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 6rpx 18rpx rgba(15, 23, 42, .06);
  box-sizing: border-box;
}

.entry-main {
  display: flex;
  min-width: 0;
  min-height: 56rpx;
  align-items: center;
  gap: 10rpx;
}

.entry-index {
  flex: 0 0 auto;
  min-width: 48rpx;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  background: #eaf2ff;
  color: #1769e0;
  font-size: 23rpx;
  font-weight: 900;
  line-height: 32rpx;
  text-align: center;
}

.entry-actions button::after,
.add-row-btn::after,
.link-btn::after,
.ignore-btn::after,
.ignored-option button::after { border: 0; }

.entry-picker {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 58rpx;
  align-items: center;
  padding: 6rpx 28rpx 6rpx 16rpx;
  border: 1rpx solid #dbe8f7;
  border-radius: 14rpx;
  background: #f8fbff;
  box-sizing: border-box;
  transition: background-color .15s ease, border-color .15s ease, transform .15s ease;
}

.entry-picker.selected {
  border-color: rgba(23, 105, 224, .34);
  background: #ffffff;
  box-shadow: inset 0 0 0 1rpx rgba(23, 105, 224, .05);
}

.entry-picker.empty {
  border-style: dashed;
  background: #f3f7fc;
}

.entry-picker-hover {
  border-color: #1769e0;
  background: #eaf2ff;
  transform: scale(.99);
}

.picker-chevron {
  display: flex;
  flex: 0 0 auto;
  width: 32rpx;
  height: 32rpx;
  align-items: center;
  justify-content: center;
  transition: transform .2s ease;
}

.picker-chevron.expanded {
  transform: rotate(180deg);
}

.entry-title {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  align-items: center;
  gap: 8rpx;
  color: #101827;
  font-size: 27rpx;
  font-weight: 900;
  line-height: 1.25;
}

.entry-title.readonly {
  padding: 0 4rpx;
}

.entry-title image {
  width: 42rpx;
  height: 42rpx;
  flex: 0 0 auto;
}

.entry-title text,
.option-title text,
.option-desc,
.ignored-option text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-empty {
  color: #94a3b8;
  font-weight: 600;
}

.entry-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4rpx;
}

.entry-actions button {
  width: 46rpx;
  height: 46rpx;
  padding: 0;
  border-radius: 12rpx;
  background: #f8fafc;
  color: #475569;
  font-size: 23rpx;
  line-height: 46rpx;
}

.entry-actions button[disabled] {
  opacity: .35;
}

.entry-actions .danger {
  color: #ff4d4f;
}

.entry-desc {
  display: block;
  margin-top: 6rpx;
  padding-left: 68rpx;
  color: #6b7280;
  font-size: 22rpx;
  line-height: 1.35;
  word-break: break-all;
}

.add-row-btn {
  width: 100%;
  height: 68rpx;
  margin-top: 16rpx;
  border-radius: 16rpx;
  background: #fff;
  color: #1769e0;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 68rpx;
}

.popup-panel {
  width: 100%;
  max-height: 72vh;
  padding: 18rpx 18rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-sizing: border-box;
}

.popup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding-bottom: 14rpx;
  border-bottom: 1rpx solid #edf2f7;
  font-size: 30rpx;
  font-weight: 900;
}

.link-btn {
  flex: 0 0 auto;
  height: 48rpx;
  padding: 0 14rpx;
  border-radius: 12rpx;
  background: #eef6ff;
  color: #1769e0;
  font-size: 24rpx;
  line-height: 48rpx;
}

.option-scroll {
  max-height: 58vh;
  margin-top: 12rpx;
}

.entry-option {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
  padding: 14rpx 8rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.entry-option.selected {
  background: #f0f7ff;
}

.option-text {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  gap: 6rpx;
}

.option-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8rpx;
  color: #101827;
  font-size: 26rpx;
  font-weight: 900;
}

.option-title image {
  width: 42rpx;
  height: 42rpx;
  flex: 0 0 auto;
}

.option-desc {
  display: block;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.35;
}

.option-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8rpx;
}

.check-mark {
  color: #1769e0;
  font-size: 30rpx;
  font-weight: 900;
}

.ignore-btn {
  width: 78rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: #fff7ed;
  color: #b45309;
  font-size: 22rpx;
  line-height: 48rpx;
}

.settings-summary {
  margin-top: 14rpx;
  color: #64748b;
  font-size: 24rpx;
}

.settings-scroll {
  max-height: 52vh;
}

.ignored-option {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.ignored-option text {
  flex: 1 1 auto;
  color: #101827;
  font-size: 25rpx;
}

.ignored-option button {
  flex: 0 0 auto;
  width: 78rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: #eaf2ff;
  color: #1769e0;
  font-size: 22rpx;
  line-height: 48rpx;
}

.empty-tip {
  padding: 46rpx 0;
  color: #94a3b8;
  font-size: 25rpx;
  text-align: center;
}

</style>



