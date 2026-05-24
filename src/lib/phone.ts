const formatByGroups = (value: string, groups: number[]) => {
  const parts: string[] = [];
  let cursor = 0;

  groups.forEach((size) => {
    if (cursor >= value.length) return;
    parts.push(value.slice(cursor, cursor + size));
    cursor += size;
  });

  if (cursor < value.length) {
    parts.push(value.slice(cursor));
  }

  return parts.filter(Boolean).join("-");
};

export const normalizePhoneNumber = (value: string) => value.replace(/\D/g, "");

export const formatStorePhoneNumber = (value: string) => {
  const onlyNums = normalizePhoneNumber(value);

  if (onlyNums.length === 0) {
    return "";
  }

  // Store phone display rules:
  // - 02 numbers: 02-123-4567, 02-1234-5678
  // - 01x mobile numbers: 010-123-4567, 010-1234-5678
  // - 03x-06x regional numbers: 031-123-4567, 031-1234-5678
  // - 12+ digit safe/custom numbers: 0507-0508-0507, 1234-5678-90123
  // - Unknown short numbers stay as digits to avoid misleading formatting.
  if (onlyNums.length >= 12) {
    return formatByGroups(onlyNums, [4, 4]);
  }

  if (onlyNums.startsWith("02")) {
    if (onlyNums.length <= 2) return onlyNums;
    if (onlyNums.length <= 5) return formatByGroups(onlyNums, [2]);
    if (onlyNums.length === 9) return formatByGroups(onlyNums, [2, 3, 4]);
    return formatByGroups(onlyNums, [2, 4, 4]);
  }

  if (/^01[0-9]/.test(onlyNums)) {
    if (onlyNums.length <= 3) return onlyNums;
    if (onlyNums.length <= 6) return formatByGroups(onlyNums, [3]);
    if (onlyNums.length === 10) return formatByGroups(onlyNums, [3, 3, 4]);
    return formatByGroups(onlyNums, [3, 4, 4]);
  }

  if (/^0[3-6][0-9]/.test(onlyNums)) {
    if (onlyNums.length <= 3) return onlyNums;
    if (onlyNums.length <= 6) return formatByGroups(onlyNums, [3]);
    if (onlyNums.length === 10) return formatByGroups(onlyNums, [3, 3, 4]);
    return formatByGroups(onlyNums, [3, 4, 4]);
  }

  if (onlyNums.length === 11) {
    return formatByGroups(onlyNums, [3, 4, 4]);
  }

  return onlyNums;
};
