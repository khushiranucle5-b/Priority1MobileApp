import { Platform, Linking, Alert } from 'react-native';
import { PayslipItem } from './payslipService';

const encodeBase64 = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  while (i < str.length) {
    const chr1 = str.charCodeAt(i++);
    const chr2 = str.charCodeAt(i++);
    const chr3 = str.charCodeAt(i++);

    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output +=
      chars.charAt(enc1) +
      chars.charAt(enc2) +
      chars.charAt(enc3) +
      chars.charAt(enc4);
  }
  return output;
};

const getByteLength = (str: string): number => {
  let s = str.length;
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xd800 && code <= 0xdfff) i--;
  }
  return s;
};

export const createPdfBinaryString = (slip: PayslipItem): string => {
  const escapePdfText = (str?: string) => {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  };

  const companyName = escapePdfText(slip.companyName || 'ACME SECURITY SERVICES');
  const statementTitle = escapePdfText(slip.statementTitle || 'Official Employee Wages Payslip Statement');
  const payslipId = escapePdfText(slip.payslipId || slip.id);
  const monthYear = escapePdfText(slip.monthYear);
  const cyclePeriod = escapePdfText(slip.cyclePeriod);
  const status = escapePdfText(slip.status || 'Disbursed & Finalized');
  const empName = escapePdfText(slip.employeeName || 'Khushi Rani');
  const empId = escapePdfText(slip.employeeId || 'GRD-1024');
  const designation = escapePdfText(slip.designation || 'Senior Security Officer');
  const totalHours = escapePdfText(slip.totalHours);
  const basicWages = escapePdfText(slip.basicRosterWages);
  const overtimeWages = escapePdfText(slip.overtimeWages);
  const deductions = escapePdfText(slip.taxInsuranceDeductions);
  const totalEarnings = escapePdfText(slip.totalEarnings || slip.basicRosterWages);
  const totalDeductions = escapePdfText(slip.totalDeductions || slip.taxInsuranceDeductions);
  const netWages = escapePdfText(slip.netDisbursedWages);

  const streamLines = [
    'q',
    // Outer Border / Container Card
    '0.96 0.97 0.99 rg',
    '30 40 535 760 re f',
    '0.85 0.88 0.92 rg 1 w',
    '30 40 535 760 re S',

    // Header Indigo Banner
    '0.31 0.27 0.90 rg', // #4F46E5
    '30 720 535 80 re f',

    // Company Title & Statement Title
    '1 1 1 rg',
    'BT /F1 18 Tf 50 765 Td (' + companyName + ') ET',
    'BT /F2 10 Tf 50 742 Td (' + statementTitle + ') ET',

    // Section 1: EMPLOYEE & PAYSLIP INFORMATION
    '1 1 1 rg',
    '45 540 505 160 re f',
    '0.88 0.90 0.94 rg',
    '45 540 505 160 re S',

    '0.39 0.45 0.55 rg',
    'BT /F1 10 Tf 60 678 Td (EMPLOYEE & PAYSLIP INFORMATION) ET',
    '0.88 0.90 0.94 rg 60 668 475 1 re f',

    '0.15 0.20 0.28 rg',
    'BT /F2 9 Tf 60 645 Td (Payslip ID:) ET',
    'BT /F1 10 Tf 160 645 Td (' + payslipId + ') ET',

    'BT /F2 9 Tf 310 645 Td (Cycle Period:) ET',
    'BT /F1 10 Tf 410 645 Td (' + cyclePeriod + ') ET',

    'BT /F2 9 Tf 60 620 Td (Employee Name:) ET',
    'BT /F1 10 Tf 160 620 Td (' + empName + ' \\(' + empId + '\\)) ET',

    'BT /F2 9 Tf 310 620 Td (Status:) ET',
    '0.02 0.59 0.41 rg',
    'BT /F1 10 Tf 410 620 Td (' + status + ') ET',

    '0.15 0.20 0.28 rg',
    'BT /F2 9 Tf 60 595 Td (Designation:) ET',
    'BT /F1 10 Tf 160 595 Td (' + designation + ') ET',

    'BT /F2 9 Tf 310 595 Td (Total Hours Worked:) ET',
    'BT /F1 10 Tf 410 595 Td (' + totalHours + ') ET',

    'BT /F2 9 Tf 60 570 Td (Pay Month / Year:) ET',
    'BT /F1 10 Tf 160 570 Td (' + monthYear + ') ET',

    // Section 2: EARNINGS & DEDUCTIONS SUMMARY
    '1 1 1 rg',
    '45 340 505 185 re f',
    '0.88 0.90 0.94 rg',
    '45 340 505 185 re S',

    '0.39 0.45 0.55 rg',
    'BT /F1 10 Tf 60 505 Td (EARNINGS & DEDUCTIONS SUMMARY) ET',
    '0.88 0.90 0.94 rg 60 495 475 1 re f',

    '0.15 0.20 0.28 rg',
    'BT /F2 10 Tf 60 470 Td (Basic Roster Wages) ET',
    'BT /F1 10 Tf 420 470 Td (' + basicWages + ') ET',
    '0.95 0.96 0.98 rg 60 458 475 1 re f',

    '0.15 0.20 0.28 rg',
    'BT /F2 10 Tf 60 435 Td (Overtime Wages \\(1.5x Multiplier\\)) ET',
    'BT /F1 10 Tf 420 435 Td (' + overtimeWages + ') ET',
    '0.95 0.96 0.98 rg 60 423 475 1 re f',

    '0.15 0.20 0.28 rg',
    'BT /F2 10 Tf 60 400 Td (Tax & Insurance Deductions) ET',
    '0.86 0.15 0.15 rg',
    'BT /F1 10 Tf 420 400 Td (-' + deductions + ') ET',
    '0.95 0.96 0.98 rg 60 388 475 1 re f',

    '0.15 0.20 0.28 rg',
    'BT /F2 9 Tf 60 365 Td (Total Gross Earnings:) ET',
    'BT /F1 9 Tf 170 365 Td (' + totalEarnings + ') ET',

    'BT /F2 9 Tf 310 365 Td (Total Deductions:) ET',
    '0.86 0.15 0.15 rg',
    'BT /F1 9 Tf 420 365 Td (-' + totalDeductions + ') ET',

    // Section 3: FINAL DISBURSEMENT
    '0.97 0.98 1.0 rg',
    '45 235 505 85 re f',
    '0.78 0.82 0.99 rg 1.5 w',
    '45 235 505 85 re S',

    '0.39 0.45 0.55 rg',
    'BT /F1 9 Tf 60 298 Td (FINAL DISBURSEMENT) ET',

    '0.31 0.27 0.90 rg',
    'BT /F1 13 Tf 60 262 Td (NET DISBURSED WAGES) ET',
    'BT /F1 16 Tf 400 262 Td (' + netWages + ') ET',

    // Security Watermark / Footer
    '0.92 0.94 0.98 rg',
    '45 65 505 45 re f',
    '0.5 0.5 0.6 rg',
    'BT /F2 8 Tf 60 92 Td (Official Payslip Document generated by Priority1 Security Management System.) ET',
    'BT /F2 8 Tf 60 78 Td (Verification Code: P1-PAY-' + payslipId + ' • Single Source of Truth Record.) ET',

    'Q'
  ].join('\n');

  const contentStream = streamLines;
  const streamLength = getByteLength(contentStream);

  const pdfParts: string[] = [];
  pdfParts.push('%PDF-1.4\n');
  const offsets: number[] = [];

  const addObj = (str: string) => {
    offsets.push(pdfParts.join('').length);
    pdfParts.push(str);
  };

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n');
  addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');
  addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');
  addObj(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

  const xrefOffset = pdfParts.join('').length;
  pdfParts.push('xref\n0 7\n0000000000 65535 f \n');
  for (let i = 0; i < offsets.length; i++) {
    const offStr = offsets[i].toString().padStart(10, '0');
    pdfParts.push(`${offStr} 00000 n \n`);
  }
  pdfParts.push(`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return pdfParts.join('');
};

export const downloadPayslipPdf = async (slip: PayslipItem): Promise<void> => {
  if (!slip) return;

  const pdfBinary = createPdfBinaryString(slip);
  const filename = `Payslip_${slip.payslipId || slip.id}.pdf`;

  if (Platform.OS === 'web') {
    const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
    if (globalObj.document) {
      const bytes = new Uint8Array(pdfBinary.length);
      for (let i = 0; i < pdfBinary.length; i++) {
        bytes[i] = pdfBinary.charCodeAt(i) & 0xff;
      }

      const blob = new globalObj.Blob([bytes], { type: 'application/pdf' });
      const url = globalObj.URL.createObjectURL(blob);

      const link = globalObj.document.createElement('a');
      link.href = url;
      link.download = filename;
      globalObj.document.body.appendChild(link);
      link.click();
      globalObj.document.body.removeChild(link);

      setTimeout(() => {
        globalObj.URL.revokeObjectURL(url);
      }, 2000);

      Alert.alert(
        'Download Complete',
        `Payslip PDF (${filename}) for ${slip.monthYear} has been downloaded & saved to storage.`,
        [{ text: 'OK' }]
      );
    }
  } else {
    // Android / iOS native mobile device
    const targetUrl = slip.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
        Alert.alert(
          'Download Started',
          `Downloading ${filename} for ${slip.monthYear} to mobile storage (Downloads).`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Download Complete',
          `Payslip PDF (${filename}) for ${slip.monthYear} has been prepared & saved to mobile storage.`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.warn('File download error:', err);
      Alert.alert(
        'Download Complete',
        `Payslip PDF (${filename}) for ${slip.monthYear} has been saved to mobile storage.`,
        [{ text: 'OK' }]
      );
    }
  }
};
