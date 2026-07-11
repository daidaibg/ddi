<template>
  <view class="equipment-page">
	<view class="save-warning">
	  <text class="save-warning-icon">⚠️</text>
	  <text>本地配置优先，其次读取云端配置，最后使用默认配置。</text>
	</view>
    <view class="save-warning">
      <text class="save-warning-icon">⚠️</text>
      <text>每次编辑完成后，请记得手动点击“保存”。</text>
    </view>

    <view v-if="openidLoading || openidError" class="openid-status" :class="{ error: openidError }">
      <text>{{ openidLoading ? 'openid 获取中...' : openidError }}</text>
      <button v-if="openidError && !openidLoading" class="openid-retry" @tap="retryGetOpenid">重新获取 openid</button>
    </view>

    <view class="sticky-action-panel">
      <view class="toolbar-grid">
        <view class="toolbar-row primary-actions">
          <view class="toolbar-item detail-item">
            <text>详情</text>
            <switch
              class="detail-switch"
              :checked="state.showFullName"
              color="#1769e0"
              @change="handleShowFullNameChange"
            />
          </view>
          <button class="toolbar-btn cloud" :disabled="state.syncing || openidLoading" @tap="useCloudConfig">
            <u-icon name="server-fill" color="currentColor" size="30rpx"></u-icon>
            <text>云端配置</text>
          </button>
          <button class="toolbar-btn export" @tap="previewImage">
            <u-icon name="photo" color="currentColor" size="30rpx"></u-icon>
            <text>预览图片</text>
          </button>
        </view>

        <view class="toolbar-row secondary-actions">
          <button class="toolbar-btn reset" :disabled="state.clearing" @tap="resetRows">
            <u-icon name="trash" color="currentColor" size="30rpx"></u-icon>
            <text>清空</text>
          </button>
          <button class="toolbar-btn ignore-manage" @tap="openIgnoredManager">
            <u-icon name="eye-off" color="currentColor" size="30rpx"></u-icon>
            <text>已忽略</text>
          </button>
          <button v-if="!state.isEditing" class="toolbar-btn edit" :disabled="state.syncing || openidLoading" @tap="startEditMode">
            <u-icon name="edit-pen" color="currentColor" size="30rpx"></u-icon>
            <text>编辑</text>
          </button>
          <button v-if="state.isEditing" class="toolbar-btn cancel" @tap="cancelEditMode">
            <u-icon name="close" color="currentColor" size="30rpx"></u-icon>
            <text>取消</text>
          </button>
          <button class="toolbar-btn save" :class="{ active: state.hasUnsavedChanges }" :disabled="state.syncing || openidLoading" @tap="handleSave">
            <u-icon name="checkmark" color="currentColor" size="30rpx"></u-icon>
            <text>保存</text>
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
    </view>

    <view class="entry-list">
      <view v-for="(row, rowIndex) in activePartRows" :key="rowIndex" class="entry-card">
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
            <button v-if="getEntry(row[activePart.key])" :disabled="rowIndex === activePartRows.length - 1" @tap.stop="moveEntry(rowIndex, activePart, 1)">↓</button>
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

    <u-popup v-model="ignoredManagerVisible" mode="bottom" border-radius="18" :safe-area-inset-bottom="true" :mask-close-able="true">
      <view class="popup-panel ignored-manager-panel">
        <view class="popup-head">
          <text>已忽略词条</text>
          <button class="link-btn" @tap="ignoredManagerVisible = false">完成</button>
        </view>
        <view class="ignored-manager-summary">
          <text>已忽略 {{ ignoredEntryTotal }} 条词条</text>
          <button v-if="ignoredEntryTotal" class="link-btn danger-link" @tap="restoreAllIgnoredEntries">全部恢复</button>
        </view>
        <scroll-view class="option-scroll ignored-manager-scroll" scroll-y>
          <view v-for="group in ignoredEntryGroups" :key="group.key" class="ignored-group">
            <view class="ignored-group-title">{{ group.label }}</view>
            <view
              v-for="entryId in group.ids"
              :key="entryId"
              class="ignored-option"
            >
              <text>{{ getEntryDisplayName(getEntry(entryId)) || entryId }}</text>
              <button @tap="restoreIgnoredEntry(group.key, entryId)">恢复</button>
            </view>
          </view>
          <view v-if="!ignoredEntryTotal" class="empty-tip">暂无已忽略词条</view>
        </scroll-view>
      </view>
    </u-popup>

    <equipment-image-preview
      v-model="previewVisible"
      :parts="previewParts"
      :rows="previewRows"
      :show-full-name="state.showFullName"
      :unsaved-warning="state.isEditing || state.hasUnsavedChanges"
    ></equipment-image-preview>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, reactive, ref, watch } from 'vue';
import { onBackPress, onLoad ,onShareAppMessage} from '@dcloudio/uni-app';
import EquipmentImagePreview from './equipment-image-preview.vue';
import { equipmentEntryListByPart, equipmentEntryMap, equipmentParts } from './equipment-entry-data.js';
import {
  clearEquipmentEntryLocalConfig,
  cloneIgnoredEntryIds,
  createDefaultEquipmentEntryRowsByPart,
  createEmptyIgnoredEntryIds,
  createEquipmentEntryExportData,
  defaultSettings,
  hasEquipmentEntryLocalConfig,
  loadEquipmentEntryRows,
  loadEquipmentEntrySettings,
  normalizeEquipmentEntryRowsByPart,
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
 G1: 'https://www.gaobug.com/img/static/kaipao/G/G1.png',
  G2: 'https://www.gaobug.com/img/static/kaipao/G/G2.png',
  G3: 'https://www.gaobug.com/img/static/kaipao/G/G3.png',
};

const partIconMap = {
  helmet: 'https://www.gaobug.com/img/static/kaipao/equipment/toukui.png',
  clothes: 'https://www.gaobug.com/img/static/kaipao/equipment/yifu.png',
  boots: 'https://www.gaobug.com/img/static/kaipao/equipment/xiezi.png',
  bracer: 'https://www.gaobug.com/img/static/kaipao/equipment/hubi.png',
  pants: 'https://www.gaobug.com/img/static/kaipao/equipment/kuzi.png',
  gloves: 'https://www.gaobug.com/img/static/kaipao/equipment/shoutao.png',
};

const toast = (title, icon = 'none') => uni.showToast({ title, icon });

const { proxy } = getCurrentInstance();
const rowsByPart = reactive(createDefaultEquipmentEntryRowsByPart());
const ignoredEntryIdsByPart = reactive(createEmptyIgnoredEntryIds());
const activePartKey = ref(equipmentParts[0].key);
const activeRowIndex = ref(-1);
const entryPopupVisible = ref(false);
const ignoredManagerVisible = ref(false);
const previewVisible = ref(false);
const openid = ref('');
const openidLoading = ref(false);
const openidError = ref('');
const allowBackWithoutPrompt = ref(false);
const state = reactive({
  isEditing: false,
  showFullName: true,
  syncing: false,
  clearing: false,
  suppressLocalSave: false,
  hasLocalConfig: false,
  hasUnsavedChanges: false,
});

const activePart = computed(() => equipmentParts.find((part) => part.key === activePartKey.value) || equipmentParts[0]);
const activePartRows = computed(() => rowsByPart[activePartKey.value] || []);
const activeRow = computed(() => activePartRows.value[activeRowIndex.value] || null);
const selectedByPart = computed(() => equipmentParts.reduce((selectedMap, part) => {
  selectedMap[part.key] = (rowsByPart[part.key] || []).map((row) => row[part.key]).filter(Boolean);
  return selectedMap;
}, {}));
const activeOptions = computed(() => (activeRow.value ? getOptions(activePart.value, activeRow.value) : []));
const ignoredEntryTotal = computed(() => equipmentParts.reduce((total, part) => {
  return total + (ignoredEntryIdsByPart[part.key] || []).length;
}, 0));
const ignoredEntryGroups = computed(() => equipmentParts
  .map((part) => ({
    key: part.key,
    label: part.label,
    ids: ignoredEntryIdsByPart[part.key] || [],
  }))
  .filter((group) => group.ids.length));
const previewParts = computed(() => equipmentParts.map((part) => ({
  key: part.key,
  label: part.label,
})));
const previewRows = computed(() => {
  const maxRows = Math.max(1, ...equipmentParts.map((part) => (rowsByPart[part.key] || []).length));
  return Array.from({ length: maxRows }, (_, rowIndex) => ({
    index: rowIndex + 1,
    cells: equipmentParts.map((part) => {
      const row = (rowsByPart[part.key] || [])[rowIndex] || {};
      const entry = getEntry(row[part.key]);
      return {
        key: part.key,
        displayName: getEntryDisplayName(entry),
        name: (entry && entry.name) || '',
        season: (entry && entry.season) || '',
      };
    }),
  }));
});

watch(rowsByPart, () => {
  markUnsaved();
}, { deep: true });
watch(ignoredEntryIdsByPart, () => {
  markUnsaved();
}, { deep: true });
watch(() => state.showFullName, () => {
  markUnsaved();
});
watch(activePartKey, () => {
  activeRowIndex.value = -1;
  entryPopupVisible.value = false;
});

function handleShowFullNameChange(event) {
  state.showFullName = !!event.detail.value;
}

function markUnsaved() {
  if (state.suppressLocalSave) return;
  state.hasUnsavedChanges = true;
}

function markSaved() {
  state.hasUnsavedChanges = false;
}

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

function replaceRowsByPart(nextRowsByPart) {
  const normalizedRowsByPart = normalizeEquipmentEntryRowsByPart(nextRowsByPart);
  equipmentParts.forEach((part) => {
    rowsByPart[part.key].splice(0, rowsByPart[part.key].length, ...normalizedRowsByPart[part.key]);
  });
}

function applyIgnoredEntryIds(settings) {
  const ignoredMap = sanitizeIgnoredEntryIds(settings);
  equipmentParts.forEach((part) => {
    ignoredEntryIdsByPart[part.key] = ignoredMap[part.key];
  });
}

function saveToLocal() {
  saveEquipmentEntryRows(createExportData().rowsByPart);
  state.hasLocalConfig = true;
}

function createExportData() {
  return createEquipmentEntryExportData(rowsByPart, {
    ignoredEntryIdsByPart: cloneIgnoredEntryIds(ignoredEntryIdsByPart),
    showFullName: state.showFullName,
  });
}

function saveSettingsToLocal() {
  saveEquipmentEntrySettings(createExportData().settings);
  state.hasLocalConfig = true;
}

function loadLocalRows() {
  replaceRowsByPart(loadEquipmentEntryRows());
}

function loadLocalSettings() {
  const settings = loadEquipmentEntrySettings();
  applyIgnoredEntryIds(settings);
  state.showFullName = settings.showFullName;
}

function applyDefaultConfig() {
  replaceRowsByPart(createDefaultEquipmentEntryRowsByPart());
  applyIgnoredEntryIds(defaultSettings);
  state.showFullName = defaultSettings.showFullName;
}

function applyExportData(data = {}, persistLocal = true) {
  replaceRowsByPart(data.rowsByPart || data.rows || createDefaultEquipmentEntryRowsByPart());
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
          url: '/blog/auth/cs/user/wechat/mini-program/openid',
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
    markSaved();
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
      saveToLocal();
      saveSettingsToLocal();
      markSaved();
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

function startEditMode() {
  state.isEditing = true;
}

async function handleSave() {
  const isSaved = await saveToBackend();
  if (isSaved) {
    state.isEditing = false;
    entryPopupVisible.value = false;
  }
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

function restoreIgnoredEntry(partKey, entryId) {
  ignoredEntryIdsByPart[partKey] = ignoredEntryIdsByPart[partKey].filter((id) => id !== entryId);
}

function restoreAllIgnoredEntries() {
  equipmentParts.forEach((part) => {
    ignoredEntryIdsByPart[part.key] = [];
  });
  toast('已恢复全部忽略词条', 'success');
}

function openIgnoredManager() {
  ignoredManagerVisible.value = true;
}

function cancelEditMode() {
  state.isEditing = false;
  entryPopupVisible.value = false;
}

function addRow() {
  activePartRows.value.push({ [activePart.value.key]: '' });
}

function removeRow(index) {
  if (activePartRows.value.length === 1) {
    activePartRows.value.splice(0, 1, { [activePart.value.key]: '' });
    return;
  }
  activePartRows.value.splice(index, 1);
}

function resetRows() {
  if (state.clearing) return;
  uni.showModal({
    title: '确认清空？',
    content: '清空后，当前装备分类中的所有词条将被删除。该操作无法直接撤销，请确认是否继续。',
    confirmText: '确认清空',
    confirmColor: '#dc2626',
    cancelText: '取消',
    success: (res) => {
      if (!res.confirm) return;
      state.clearing = true;
      const previousRows = activePartRows.value.map((row) => ({ ...row }));
      try {
        rowsByPart[activePart.value.key].splice(0, rowsByPart[activePart.value.key].length, { [activePart.value.key]: '' });
        toast('已清空当前分类', 'success');
      } catch (error) {
        rowsByPart[activePart.value.key].splice(0, rowsByPart[activePart.value.key].length, ...previousRows);
        console.warn('清空装备词条失败', error);
        toast('清空失败，请稍后再试');
      } finally {
        state.clearing = false;
      }
    },
  });
}

function moveEntry(rowIndex, part, direction) {
  const nextIndex = rowIndex + direction;
  const partRows = rowsByPart[part.key] || [];
  if (nextIndex < 0 || nextIndex >= partRows.length) return;
  const currentValue = partRows[rowIndex][part.key];
  if (!currentValue) return;
  const nextValue = partRows[nextIndex][part.key];
  partRows[rowIndex][part.key] = nextValue;
  partRows[nextIndex][part.key] = currentValue;
}

function previewImage() {
  previewVisible.value = true;
}

onLoad(async () => {
  await ensureOpenid();
  await loadInitialConfig();
});

onBackPress(() => {
  if (allowBackWithoutPrompt.value) return false;
  if (!state.hasUnsavedChanges) return false;

  uni.showModal({
    title: '当前修改尚未保存',
    content: '当前修改尚未保存，确定要离开吗？',
    confirmText: '离开',
    confirmColor: '#dc2626',
    cancelText: '继续编辑',
    success: (res) => {
      if (res.confirm) {
        allowBackWithoutPrompt.value = true;
        uni.navigateBack();
      }
    },
  });

  return true;
});
</script>

<style lang="scss">
.equipment-page {
  min-height: 100vh;
  width: 100%;
  padding: 22rpx 18rpx 48rpx;
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, .92), transparent 34%),
    linear-gradient(180deg, #eef5ff 0%, #f8fbff 48%, #f2f7ff 100%);
  color: #111827;
  box-sizing: border-box;
}


.page-subtitle {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.45;
}

.save-warning {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin-top: 16rpx;
  padding: 16rpx 18rpx;
  border: 1rpx solid rgba(251, 191, 36, .34);
  border-radius: 20rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .72), rgba(255, 247, 214, .54)),
    rgba(255, 245, 204, .56);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, .9),
    0 10rpx 24rpx rgba(180, 83, 9, .08);
  color: #9a5a05;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 1.45;
  box-sizing: border-box;
  backdrop-filter: blur(16rpx);
  -webkit-backdrop-filter: blur(16rpx);
}

.save-warning-icon {
  flex: 0 0 auto;
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

.sticky-action-panel {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 20;
  margin: 16rpx -18rpx 0;
  padding: 8rpx 18rpx 4rpx;
  background:
    linear-gradient(180deg, rgba(239, 246, 255, .96), rgba(248, 251, 255, .92));
  box-shadow: 0 12rpx 26rpx rgba(37, 67, 101, .08);
  box-sizing: border-box;
}

.toolbar-grid {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 18rpx;
  padding: 12rpx;
  border: 1rpx solid rgba(255, 255, 255, .78);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, .26);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .8), 0 16rpx 36rpx rgba(45, 72, 105, .10);
}

.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 14rpx;
}

.primary-actions {
  gap: 16rpx;
}

.secondary-actions {
  gap: 12rpx;
  padding-top: 4rpx;
}

.toolbar-item,
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  flex: 0 0 auto;
  width: auto;
  min-width: 152rpx;
  max-width: 280rpx;
  height: 62rpx;
  padding: 0 32rpx;
  border: 1rpx solid rgba(255, 255, 255, .82);
  border-radius: 999rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .74), rgba(226, 238, 250, .42)),
    rgba(236, 244, 255, .38);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, .96),
    inset 0 -1rpx 0 rgba(92, 122, 158, .10),
    0 10rpx 22rpx rgba(36, 65, 98, .12);
  color: #23384f;
  font-size: 24rpx;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  box-sizing: border-box;
  white-space: normal;
  word-break: keep-all;
  transition: transform .14s ease, opacity .14s ease, box-shadow .14s ease, background-color .14s ease;
}

.toolbar-item text,
.toolbar-btn text {
  display: block;
  min-width: 0;
  line-height: 1.15;
  text-align: center;
}

.toolbar-btn .u-icon,
.toolbar-item .u-icon {
  flex: 0 0 auto;
}

.toolbar-btn::after {
  border: 0;
}

.toolbar-btn:active,
.toolbar-item:active,
.part-tab:active,
.entry-actions button:active,
.add-row-btn:active,
.link-btn:active,
.ignore-btn:active,
.ignored-option button:active {
  transform: translateY(2rpx) scale(.985);
  box-shadow:
    inset 0 2rpx 6rpx rgba(31, 51, 78, .12),
    0 4rpx 12rpx rgba(36, 65, 98, .08);
}

.toolbar-btn[disabled],
.entry-actions button[disabled],
.preview-tool[disabled] {
  opacity: .42;
}

.detail-item {
  gap: 8rpx;
  min-width: 172rpx;
  padding-left: 30rpx;
  padding-right: 16rpx;
}

.detail-switch {
  flex: 0 0 auto;
  transform: scale(.72);
  transform-origin: center;
}

.reset,
.ignore-manage,
.cloud,
.export,
.edit,
.cancel,
.save {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(225, 238, 251, .42)),
    rgba(235, 244, 255, .38);
}

.reset {
  color: #b4232a;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(255, 229, 232, .44)),
    rgba(255, 242, 244, .56);
}

.save.active {
  color: #075fb8;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .84), rgba(196, 224, 255, .52)),
    rgba(220, 239, 255, .54);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, .96),
    0 0 0 1rpx rgba(23, 105, 224, .10),
    0 12rpx 26rpx rgba(23, 105, 224, .16);
}

@media (min-width: 768px) {
  .toolbar-grid {
    gap: 24rpx;
    padding: 16rpx;
  }

  .toolbar-row {
    gap: 24rpx;
  }

  .toolbar-item,
  .toolbar-btn {
    height: 68rpx;
    min-width: 176rpx;
    max-width: 340rpx;
    padding-left: 44rpx;
    padding-right: 44rpx;
    font-size: 26rpx;
  }

  .detail-item {
    min-width: 196rpx;
    padding-left: 42rpx;
    padding-right: 22rpx;
  }
}

.part-tabs {
  width: 100%;
  margin-top: 12rpx;
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
  height: 60rpx;
  min-width: 120rpx;
  padding: 0 18rpx;
  border: 1rpx solid rgba(255, 255, 255, .76);
  border-radius: 999rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .76), rgba(229, 239, 250, .42)),
    rgba(240, 247, 255, .42);
  color: #536071;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 60rpx;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .92), 0 6rpx 16rpx rgba(43, 76, 112, .09);
  transition: transform .14s ease, box-shadow .14s ease, background-color .14s ease;
}

.part-tab::after { border: 0; }

.part-tab image {
  width: 38rpx;
  height: 38rpx;
  flex: 0 0 auto;
}

.part-tab.active {
  border-color: rgba(23, 105, 224, .28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .84), rgba(197, 224, 255, .52)),
    rgba(221, 239, 255, .58);
  color: #1769e0;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .95), 0 10rpx 22rpx rgba(23, 105, 224, .14);
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 6rpx;
}

.entry-card {
  width: 100%;
  padding: 10rpx 12rpx;
  border: 1rpx solid rgba(255, 255, 255, .78);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, .64);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .86), 0 10rpx 26rpx rgba(31, 58, 91, .08);
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
  background: rgba(225, 239, 255, .76);
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
  min-height: 62rpx;
  align-items: center;
  padding: 6rpx 28rpx 6rpx 16rpx;
  border: 1rpx solid rgba(255, 255, 255, .82);
  border-radius: 18rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .76), rgba(228, 239, 251, .42)),
    rgba(241, 247, 255, .48);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .9), 0 6rpx 16rpx rgba(37, 70, 103, .07);
  box-sizing: border-box;
  transition: background-color .15s ease, border-color .15s ease, transform .15s ease, box-shadow .15s ease;
}

.entry-picker.selected {
  border-color: rgba(23, 105, 224, .24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .82), rgba(212, 233, 255, .48)),
    rgba(235, 246, 255, .62);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .94), 0 8rpx 18rpx rgba(23, 105, 224, .10);
}

.entry-picker.empty {
  border-style: solid;
  background: rgba(241, 247, 253, .44);
}

.entry-picker-hover {
  border-color: rgba(23, 105, 224, .28);
  background: rgba(224, 239, 255, .62);
  transform: translateY(2rpx) scale(.992);
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
  gap: 6rpx;
}

.entry-actions button {
  width: 50rpx;
  height: 50rpx;
  padding: 0;
  border: 1rpx solid rgba(255, 255, 255, .78);
  border-radius: 16rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(229, 239, 250, .42)),
    rgba(240, 247, 255, .46);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .9), 0 6rpx 14rpx rgba(36, 65, 98, .10);
  color: #40566f;
  font-size: 23rpx;
  font-weight: 900;
  line-height: 50rpx;
  transition: transform .14s ease, opacity .14s ease, box-shadow .14s ease;
}

.entry-actions button[disabled] {
  opacity: .35;
}

.entry-actions .danger {
  color: #e34a52;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(255, 229, 232, .42)),
    rgba(255, 241, 243, .52);
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
  border: 1rpx solid rgba(255, 255, 255, .82);
  border-radius: 999rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .82), rgba(222, 238, 255, .48)),
    rgba(236, 246, 255, .58);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .94), 0 10rpx 24rpx rgba(23, 105, 224, .10);
  color: #1769e0;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 68rpx;
  transition: transform .14s ease, box-shadow .14s ease;
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
  height: 50rpx;
  padding: 0 18rpx;
  border: 1rpx solid rgba(255, 255, 255, .78);
  border-radius: 999rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(222, 238, 255, .44)),
    rgba(236, 246, 255, .58);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .92), 0 6rpx 14rpx rgba(23, 105, 224, .08);
  color: #1769e0;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 50rpx;
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
  border: 1rpx solid rgba(255, 255, 255, .78);
  border-radius: 16rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(255, 238, 218, .46)),
    rgba(255, 247, 237, .55);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .92), 0 6rpx 14rpx rgba(180, 83, 9, .08);
  color: #b45309;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.ignored-manager-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 14rpx;
  color: #64748b;
  font-size: 24rpx;
}

.ignored-manager-scroll {
  max-height: 52vh;
}

.danger-link {
  color: #dc2626;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(255, 229, 232, .44)),
    rgba(255, 242, 244, .56);
}

.ignored-group {
  padding-top: 8rpx;
}

.ignored-group-title {
  padding: 10rpx 0 4rpx;
  color: #64748b;
  font-size: 23rpx;
  font-weight: 800;
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
  border: 1rpx solid rgba(255, 255, 255, .78);
  border-radius: 16rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .78), rgba(222, 238, 255, .44)),
    rgba(236, 246, 255, .58);
  color: #1769e0;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.empty-tip {
  padding: 46rpx 0;
  color: #94a3b8;
  font-size: 25rpx;
  text-align: center;
}

</style>
