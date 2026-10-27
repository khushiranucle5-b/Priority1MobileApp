import {
  STANDARD_EXPENSE_CATEGORIES,
  STANDARD_EXPENSE_PAYMENT_TYPES,
  VehicleExpenseClaim,
} from '../src/features/visitors/types/visitor.types';
import { getSeedExpenseClaims, formatAmountK } from '../src/features/visitors/services/visitor.service';

describe('Operational & Vehicle Expense Management Suite', () => {
  describe('Expense Categories & Payment Types Requirements', () => {
    test('Must include Fuel and Mileage as standard category', () => {
      expect(STANDARD_EXPENSE_CATEGORIES).toContain('Fuel and Mileage');
    });

    test('Must include all operational categories requested', () => {
      expect(STANDARD_EXPENSE_CATEGORIES).toContain('Travel & Parking');
      expect(STANDARD_EXPENSE_CATEGORIES).toContain('Equipment & Gear');
      expect(STANDARD_EXPENSE_CATEGORIES).toContain('Supplies & Maintenance');
      expect(STANDARD_EXPENSE_CATEGORIES).toContain('Meals & Food');
      expect(STANDARD_EXPENSE_CATEGORIES).toContain('Emergency Response');
      expect(STANDARD_EXPENSE_CATEGORIES).toContain('Other');
    });

    test('Must support Employee-Paid payment type', () => {
      expect(STANDARD_EXPENSE_PAYMENT_TYPES).toContain('Employee Reimbursement');
      expect(STANDARD_EXPENSE_PAYMENT_TYPES).toContain('Company Card');
      expect(STANDARD_EXPENSE_PAYMENT_TYPES).toContain('Petty Cash');
    });
  });

  describe('Seed Claims Structure & Edit Permission Rules', () => {
    const seedClaims = getSeedExpenseClaims();

    test('All seed claims have businessPurpose, expenseCategory, merchantName, and claimedAmount', () => {
      expect(seedClaims.length).toBeGreaterThan(0);
      seedClaims.forEach((claim) => {
        expect(claim.businessPurpose).toBeDefined();
        expect(typeof claim.businessPurpose).toBe('string');
        expect(claim.businessPurpose.length).toBeGreaterThan(0);

        expect(claim.expenseCategory).toBeDefined();
        expect(claim.expenseType).toBeDefined();
        expect(claim.merchantName).toBeDefined();
        expect(claim.claimedAmount).toBeGreaterThan(0);
        expect(claim.currency).toBe('$');
      });
    });

    test('Editing is ONLY permitted when status is "Changes Requested by Supervisor"', () => {
      const isClaimEditable = (claim: VehicleExpenseClaim): boolean => {
        return claim.status === 'Changes Requested by Supervisor';
      };

      const changesRequestedClaim = seedClaims.find((c) => c.status === 'Changes Requested by Supervisor');
      expect(changesRequestedClaim).toBeDefined();
      expect(isClaimEditable(changesRequestedClaim!)).toBe(true);

      const pendingClaim = seedClaims.find((c) => c.status === 'Pending Supervisor Approval');
      expect(pendingClaim).toBeDefined();
      expect(isClaimEditable(pendingClaim!)).toBe(false);

      const approvedClaim = seedClaims.find((c) => c.status === 'Approved');
      expect(approvedClaim).toBeDefined();
      expect(isClaimEditable(approvedClaim!)).toBe(false);
    });

    test('Claims with Changes Requested have supervisorNotes feedback attached', () => {
      const revisionClaim = seedClaims.find((c) => c.status === 'Changes Requested by Supervisor');
      expect(revisionClaim?.supervisorNotes).toBeDefined();
      expect(revisionClaim?.supervisorNotes?.length).toBeGreaterThan(0);
    });

    test('Fuel claims properly link to vehicle and odometer', () => {
      const fuelClaim = seedClaims.find((c) => c.expenseCategory === 'Fuel and Mileage');
      expect(fuelClaim).toBeDefined();
      expect(fuelClaim?.vehiclePlate).toBeDefined();
      expect(fuelClaim?.odometerReading).toBeGreaterThan(0);
    });

    test('Non-vehicle operational claims exist without vehicle link', () => {
      const equipmentClaim = seedClaims.find((c) => c.expenseCategory === 'Equipment & Gear');
      expect(equipmentClaim).toBeDefined();
      expect(equipmentClaim?.merchantName).toBe('Tactical Supply Co.');
    });
  });

  describe('Amount formatting > 999 to K', () => {
    test('Formats numbers <= 999 with 2 decimals', () => {
      expect(formatAmountK(0)).toBe('$0.00');
      expect(formatAmountK(250)).toBe('$250.00');
      expect(formatAmountK(999)).toBe('$999.00');
    });

    test('Formats numbers > 999 into k suffix', () => {
      expect(formatAmountK(1000)).toBe('$1k');
      expect(formatAmountK(1200)).toBe('$1.2k');
      expect(formatAmountK(3250)).toBe('$3.25k');
      expect(formatAmountK(2850)).toBe('$2.85k');
      expect(formatAmountK(10500)).toBe('$10.5k');
    });
  });
});
