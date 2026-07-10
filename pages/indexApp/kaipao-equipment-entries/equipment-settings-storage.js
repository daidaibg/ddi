import { equipmentEntryListByPart, equipmentEntryMap, equipmentParts } from './equipment-entry-data.js';

export const ENTRY_IDS_STORAGE_KEY = 'kaipao_equipment_entry_ids';
export const SETTINGS_STORAGE_KEY = 'kaipao_equipment_entry_settings';
export const OPENID_STORAGE_KEY = 'openid';
export const USER_SESSION_STORAGE_KEY = 'wxloginsession';

const DEFAULT_ROW_COUNT = 6;
const DEFAULT_SHOW_FULL_NAME = true;

export const createEmptyIgnoredEntryIds = () => ({
  helmet: [],
  clothes: [],
  boots: [],
  bracer: [],
  pants: [],
  gloves: [],
});

export const createEmptyEquipmentEntryRow = () => ({
  helmet: '',
  clothes: '',
  boots: '',
  bracer: '',
  pants: '',
  gloves: '',
});

export const createDefaultEquipmentEntryRows = () => Array.from({ length: DEFAULT_ROW_COUNT }, createEmptyEquipmentEntryRow);

export const cloneIgnoredEntryIds = (ignoredEntryIdsByPart) => {
  return equipmentParts.reduce((ignoredMap, part) => {
    ignoredMap[part.key] = [...(ignoredEntryIdsByPart[part.key] || [])];
    return ignoredMap;
  }, createEmptyIgnoredEntryIds());
};

export const sanitizeEquipmentEntryRow = (row = {}) => {
  return equipmentParts.reduce((nextRow, part) => {
    const value = row[part.key] || '';
    nextRow[part.key] = value && equipmentEntryMap[value] ? value : '';
    return nextRow;
  }, createEmptyEquipmentEntryRow());
};

export const normalizeEquipmentEntryRows = (rows = []) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  return [...safeRows, ...createDefaultEquipmentEntryRows()]
    .slice(0, Math.max(safeRows.length, DEFAULT_ROW_COUNT))
    .map(sanitizeEquipmentEntryRow);
};

export const sanitizeIgnoredEntryIds = (settings = {}) => {
  const ignoredMap = settings.ignoredEntryIdsByPart || createEmptyIgnoredEntryIds();

  return equipmentParts.reduce((nextIgnoredMap, part) => {
    const entryIds = Array.isArray(ignoredMap[part.key]) ? ignoredMap[part.key] : [];
    const partEntryIds = new Set(equipmentEntryListByPart[part.key].map((entry) => entry.id));
    nextIgnoredMap[part.key] = entryIds.filter((entryId) => partEntryIds.has(entryId));
    return nextIgnoredMap;
  }, createEmptyIgnoredEntryIds());
};

export const sanitizeEquipmentEntrySettings = (settings = {}) => ({
  ignoredEntryIdsByPart: sanitizeIgnoredEntryIds(settings),
  showFullName: typeof settings.showFullName === 'boolean' ? settings.showFullName : DEFAULT_SHOW_FULL_NAME,
});

const readStorage = (key) => {
  try {
    return uni.getStorageSync(key);
  } catch (err) {
    console.warn(`读取${key}缓存失败`, err);
    return '';
  }
};

const writeStorage = (key, value) => {
  try {
    uni.setStorageSync(key, value);
  } catch (err) {
    console.warn(`写入${key}缓存失败`, err);
  }
};

export const loadEquipmentEntrySettings = () => {
  const cache = readStorage(SETTINGS_STORAGE_KEY);
  if (!cache) return sanitizeEquipmentEntrySettings();

  try {
    return sanitizeEquipmentEntrySettings(typeof cache === 'string' ? JSON.parse(cache) : cache);
  } catch (err) {
    console.warn('读取向僵尸开炮装备词条设置缓存失败', err);
    return sanitizeEquipmentEntrySettings();
  }
};

export const hasEquipmentEntryLocalConfig = () => {
  return Boolean(readStorage(ENTRY_IDS_STORAGE_KEY) || readStorage(SETTINGS_STORAGE_KEY));
};

export const saveEquipmentEntrySettings = (settings) => {
  writeStorage(SETTINGS_STORAGE_KEY, JSON.stringify(sanitizeEquipmentEntrySettings(settings)));
};

export const loadEquipmentEntryRows = () => {
  const cache = readStorage(ENTRY_IDS_STORAGE_KEY);
  if (!cache) return createDefaultEquipmentEntryRows();

  try {
    const parsedRows = typeof cache === 'string' ? JSON.parse(cache) : cache;
    return Array.isArray(parsedRows) ? normalizeEquipmentEntryRows(parsedRows) : createDefaultEquipmentEntryRows();
  } catch (err) {
    console.warn('读取向僵尸开炮装备词条缓存失败', err);
    return createDefaultEquipmentEntryRows();
  }
};

export const saveEquipmentEntryRows = (rows) => {
  writeStorage(ENTRY_IDS_STORAGE_KEY, JSON.stringify(rows));
};

export const clearEquipmentEntryLocalConfig = () => {
  uni.removeStorageSync(ENTRY_IDS_STORAGE_KEY);
  uni.removeStorageSync(SETTINGS_STORAGE_KEY);
};

export const createEquipmentEntryExportData = (rows, settings) => ({
  rows: rows.map((row) => ({ ...row })),
  settings: sanitizeEquipmentEntrySettings(settings),
});

export const defaultSettings = {
  ignoredEntryIdsByPart: {
    helmet: ['10015', '10018', '10020', '10022', '10024', '10028', '10036', '10038', '10040', '10042', '10044', '10048', '10050', '10045', '10039', '10037', '10025', '10023', '10021', '10010'],
    clothes: ['20013', '20016', '20018', '20020', '20022', '20024', '20019', '20021', '20023', '20035', '20037', '20038', '20040', '20042', '20048', '20043', '20045', '20047', '20049'],
    boots: ['30016', '30014', '30017', '30019', '30020', '30021', '30035', '30041', '30043', '30046', '30024', '30005'],
    bracer: ['50014', '50016', '50017', '50019', '50020', '50021', '50051', '50049', '50045', '50043', '50012', '50042', '50040'],
    pants: ['40050', '40049', '40045', '40043', '40042', '40026', '40038', '40037', '40041', '40010', '40017', '40016', '40019', '40021', '40020'],
    gloves: ['60022', '60040', '60045', '60047', '60043', '60050', '60021', '60020', '60018', '60017', '60015', '60011', '60009', '60006', '60008', '60007', '60010'],
  },
  showFullName: false,
};

