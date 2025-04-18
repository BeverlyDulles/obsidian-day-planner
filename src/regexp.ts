const ulToken = `[-*+]`;
const olToken = `\\d+[.)]`;
const listToken = `(${ulToken}|${olToken})`;
const listTokenWithSpaces = `\\s*${listToken}\\s+`;

const checkbox = `\\s*\\[(?<completion>[^\\]])]\\s+`;

const durationSeparator = `\\s?-{1,2}\\s?`;

const hours = `\\d{1,2}`;
const minutes = `\\d{2}`;
const hourMinuteSeparator = `[:. ]`;
const strictHourMinuteSeparator = ":";
const amPm = "\\s?[apAP][mM](?!\\w)";

const date = "\\d{4}-\\d{2}-\\d{2}";

const time = `(${hours})(?:${hourMinuteSeparator}?(${minutes}))?(${amPm})?`;
const strictTime = `${hours}${strictHourMinuteSeparator}${minutes}(${amPm})?`;

export const listTokenWithSpacesRegExp = new RegExp(listTokenWithSpaces);
export const checkboxRegExp = new RegExp(checkbox);
export const timeRegExp = new RegExp(time);
export const timeFromStartRegExp = new RegExp(`^${time}`);
export const headingRegExp = /^(#+)\s/;
export const obsidianBlockIdRegExp = /\s\^[a-z1-9-]+$/i;

export const looseTimestampAtStartOfLineRegExp = new RegExp(
  `^(?<start>${time})(?:${durationSeparator}(?<end>${time}))?`,
  "im",
);
export const strictTimestampAnywhereInLineRegExp = new RegExp(
  `(?<start>${strictTime})(?:${durationSeparator}(?<end>${strictTime}))?`,
  "im",
);

export const scheduledPropRegExp = new RegExp(
  `(\\[scheduled\\s*::\\s*)${date}(\\])`,
);

export const keylessScheduledPropRegExp = new RegExp(
  `(\\(scheduled\\s*::\\s*)${date}(\\))`,
);

export const shortScheduledPropRegExp = new RegExp(`(📅 \\s*)${date}`);

export const scheduledPropRegExps = [
  scheduledPropRegExp,
  keylessScheduledPropRegExp,
  shortScheduledPropRegExp,
];

// 修改为正确的due属性名称（而不是dued）
export const duePropRegExp = new RegExp(`(\\[due\\s*::\\s*)${date}(\\])`);

export const keylessDuePropRegExp = new RegExp(
  `(\\(due\\s*::\\s*)${date}(\\))`,
);

// 短格式的emoji表示保持不变
export const shortDuePropRegExp = new RegExp(`(📅 \\s*)${date}`);

export const duePropRegExps = [
  duePropRegExp,
  keylessDuePropRegExp,
  shortDuePropRegExp,
];

export const propRegexp = /\[([^\]]+)::([^\]]+)\]/g;

export const dashOrNumberWithMultipleSpaces = /(-|\d+[.)])\s+/g;
export const escapedSquareBracket = /\\\[/g;
export const mdastUtilListIndentationSpaces = new RegExp(
  `^( {4})+(?=${listToken})`,
  "gm",
);

export const repeatingNewlinesRegExp = /\n+/g;
