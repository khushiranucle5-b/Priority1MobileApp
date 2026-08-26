export interface PayslipItem {
  id: string;
  companyName: string;
  statementTitle: string;
  payslipId: string;
  monthYear: string;
  cyclePeriod: string;
  status: string;
  employeeName?: string;
  employeeId?: string;
  designation: string;
  totalHours: string;
  basicRosterWages: string;
  overtimeWages: string;
  taxInsuranceDeductions: string;
  netDisbursedWages: string;
  totalEarnings?: string;
  totalDeductions?: string;
  pdfUrl?: string;
}

export type ExtendedPayslipItem = PayslipItem;

export const getPayslipList = (guardState?: { guardName?: string | null; guardId?: string | null }): PayslipItem[] => {
  const name = guardState?.guardName || 'Khushi Rani';
  const id = guardState?.guardId || 'GRD-1024';

  return [
    {
      id: 'pay-2026-08',
      companyName: 'ACME SECURITY SERVICES',
      statementTitle: 'Official Employee Wages Payslip Statement',
      payslipId: 'PAY-2026-08',
      monthYear: 'August 2026',
      cyclePeriod: 'Aug 01, 2026 - Aug 31, 2026',
      status: 'Disbursed & Finalized',
      employeeName: name,
      employeeId: id,
      designation: 'Senior Security Officer',
      totalHours: '176 hrs',
      basicRosterWages: '₹24,000.00',
      overtimeWages: '₹4,500.00',
      taxInsuranceDeductions: '₹2,500.00',
      totalEarnings: '₹28,500.00',
      totalDeductions: '₹2,500.00',
      netDisbursedWages: '₹26,000.00',
    },
    {
      id: 'pay-2026-07',
      companyName: 'ACME SECURITY SERVICES',
      statementTitle: 'Official Employee Wages Payslip Statement',
      payslipId: 'PAY-2026-07',
      monthYear: 'July 2026',
      cyclePeriod: 'Jul 01, 2026 - Jul 31, 2026',
      status: 'Disbursed & Finalized',
      employeeName: name,
      employeeId: id,
      designation: 'Senior Security Officer',
      totalHours: '168 hrs',
      basicRosterWages: '₹22,000.00',
      overtimeWages: '₹4,500.00',
      taxInsuranceDeductions: '₹2,100.00',
      totalEarnings: '₹26,500.00',
      totalDeductions: '₹2,100.00',
      netDisbursedWages: '₹24,400.00',
    },
    {
      id: 'pay-2026-06',
      companyName: 'ACME SECURITY SERVICES',
      statementTitle: 'Official Employee Wages Payslip Statement',
      payslipId: 'PAY-2026-06',
      monthYear: 'June 2026',
      cyclePeriod: 'Jun 01, 2026 - Jun 30, 2026',
      status: 'Disbursed & Finalized',
      employeeName: name,
      employeeId: id,
      designation: 'Senior Security Officer',
      totalHours: '160 hrs',
      basicRosterWages: '₹22,000.00',
      overtimeWages: '₹3,800.00',
      taxInsuranceDeductions: '₹2,000.00',
      totalEarnings: '₹25,800.00',
      totalDeductions: '₹2,000.00',
      netDisbursedWages: '₹23,800.00',
    },
    {
      id: 'pay-2026-05',
      companyName: 'ACME SECURITY SERVICES',
      statementTitle: 'Official Employee Wages Payslip Statement',
      payslipId: 'PAY-2026-05',
      monthYear: 'May 2026',
      cyclePeriod: 'May 01, 2026 - May 31, 2026',
      status: 'Disbursed & Finalized',
      employeeName: name,
      employeeId: id,
      designation: 'Senior Security Officer',
      totalHours: '168 hrs',
      basicRosterWages: '₹22,000.00',
      overtimeWages: '₹3,000.00',
      taxInsuranceDeductions: '₹2,000.00',
      totalEarnings: '₹25,000.00',
      totalDeductions: '₹2,000.00',
      netDisbursedWages: '₹23,000.00',
    },
    {
      id: 'pay-2025-12',
      companyName: 'ACME SECURITY SERVICES',
      statementTitle: 'Official Employee Wages Payslip Statement',
      payslipId: 'PAY-2025-12',
      monthYear: 'December 2025',
      cyclePeriod: 'Dec 01, 2025 - Dec 31, 2025',
      status: 'Disbursed & Finalized',
      employeeName: name,
      employeeId: id,
      designation: 'Senior Security Officer',
      totalHours: '172 hrs',
      basicRosterWages: '₹21,000.00',
      overtimeWages: '₹4,000.00',
      taxInsuranceDeductions: '₹1,900.00',
      totalEarnings: '₹25,000.00',
      totalDeductions: '₹1,900.00',
      netDisbursedWages: '₹23,100.00',
    },
  ];
};

export const getPayslipById = (payslipId: string, guardState?: { guardName?: string | null; guardId?: string | null }): PayslipItem => {
  const list = getPayslipList(guardState);
  return list.find(s => s.id === payslipId || s.payslipId === payslipId) || list[0];
};
