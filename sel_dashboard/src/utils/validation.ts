export function isValidIpAddress(ipAddress: string): boolean {
  const ipPattern =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  return ipPattern.test(ipAddress.trim());
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}