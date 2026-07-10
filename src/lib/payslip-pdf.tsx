import "server-only";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ROLE_LABEL, DEPARTMENT_LABEL } from "./types";
import type { Employee, Payslip } from "./types";
import { formatCurrency, formatPeriodLabel } from "./format";

// Font default Helvetica bawaan @react-pdf/renderer dipakai apa adanya —
// register font kustom butuh fetch dari internet yang tidak tersedia di
// sandbox build ini (sama seperti kasus next/font di halaman web).
Font.registerHyphenationCallback((word) => [word]);

const NAVY = "#1E2A44";
const AMBER = "#C96A2E";
const BORDER = "#DDD8CC";
const MUTED = "#6B6557";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#171B21", fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: `2 solid ${NAVY}`,
  },
  brand: { fontSize: 16, fontWeight: 700, color: NAVY, fontFamily: "Helvetica-Bold" },
  brandSub: { fontSize: 9, color: MUTED, marginTop: 2 },
  periodBadge: {
    backgroundColor: NAVY,
    color: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  employeeBlock: { marginBottom: 20 },
  employeeName: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  employeeMeta: { fontSize: 9, color: MUTED },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 6,
    marginTop: 16,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottom: `1 solid ${BORDER}`,
  },
  rowLabel: { color: "#171B21" },
  rowValue: { fontFamily: "Helvetica-Bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  netPayBox: {
    backgroundColor: NAVY,
    color: "#FFFFFF",
    padding: 14,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netPayLabel: { fontSize: 11 },
  netPayValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: AMBER },
  attendanceGrid: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  attendanceCell: {
    flex: 1,
    border: `1 solid ${BORDER}`,
    padding: 8,
  },
  attendanceValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: NAVY },
  attendanceLabel: { fontSize: 8, color: MUTED, marginTop: 2 },
  footer: {
    marginTop: 28,
    paddingTop: 12,
    borderTop: `1 solid ${BORDER}`,
    fontSize: 8,
    color: MUTED,
    lineHeight: 1.5,
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function PayslipDocument({
  payslip,
  employee,
}: {
  payslip: Payslip;
  employee: Employee;
}) {
  return (
    <Document
      title={`Slip Gaji ${employee.name} - ${formatPeriodLabel(payslip.period)}`}
      author="EgaLog HR"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>EGALOG HR</Text>
            <Text style={styles.brandSub}>PT EgaLog Indonesia</Text>
          </View>
          <Text style={styles.periodBadge}>{formatPeriodLabel(payslip.period).toUpperCase()}</Text>
        </View>

        <View style={styles.employeeBlock}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeeMeta}>
            {employee.jobTitle} · {ROLE_LABEL[employee.role]} ·{" "}
            {DEPARTMENT_LABEL[employee.department]}
          </Text>
          <Text style={styles.employeeMeta}>NIP: {employee.nip}</Text>
        </View>

        <View style={styles.attendanceGrid}>
          <View style={styles.attendanceCell}>
            <Text style={styles.attendanceValue}>
              {payslip.attendance.presentDays}/{payslip.attendance.workingDays}
            </Text>
            <Text style={styles.attendanceLabel}>Hari Hadir</Text>
          </View>
          <View style={styles.attendanceCell}>
            <Text style={styles.attendanceValue}>{payslip.attendance.lateDays}</Text>
            <Text style={styles.attendanceLabel}>Hari Telat</Text>
          </View>
          <View style={styles.attendanceCell}>
            <Text style={styles.attendanceValue}>{payslip.attendance.leaveDays}</Text>
            <Text style={styles.attendanceLabel}>Hari Cuti</Text>
          </View>
          <View style={styles.attendanceCell}>
            <Text style={styles.attendanceValue}>{payslip.attendance.alphaDays}</Text>
            <Text style={styles.attendanceLabel}>Hari Alpha</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pendapatan</Text>
        <Row label="Gaji Pokok" value={formatCurrency(payslip.earnings.baseSalary)} />
        <Row
          label={`Tunjangan Transport (${payslip.attendance.presentDays} hari)`}
          value={formatCurrency(payslip.earnings.allowanceTransport)}
        />
        <Row
          label={`Tunjangan Makan (${payslip.attendance.presentDays} hari)`}
          value={formatCurrency(payslip.earnings.allowanceMeal)}
        />
        {payslip.earnings.allowancePosition > 0 && (
          <Row label="Tunjangan Jabatan" value={formatCurrency(payslip.earnings.allowancePosition)} />
        )}
        {payslip.earnings.overtimeHours > 0 && (
          <Row
            label={`Lembur (${payslip.earnings.overtimeHours} jam)`}
            value={formatCurrency(payslip.earnings.overtimePay)}
          />
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Pendapatan</Text>
          <Text style={styles.totalValue}>{formatCurrency(payslip.grossPay)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Potongan</Text>
        <Row label="BPJS (estimasi)" value={`- ${formatCurrency(payslip.deductions.bpjs)}`} />
        <Row
          label="PPh21 (estimasi)"
          value={`- ${formatCurrency(payslip.deductions.incomeTax)}`}
        />
        {payslip.deductions.latePenalty > 0 && (
          <Row
            label={`Denda Telat (${payslip.attendance.lateDays} hari)`}
            value={`- ${formatCurrency(payslip.deductions.latePenalty)}`}
          />
        )}
        {payslip.deductions.absencePenalty > 0 && (
          <Row
            label={`Potongan Alpha (${payslip.attendance.alphaDays} hari)`}
            value={`- ${formatCurrency(payslip.deductions.absencePenalty)}`}
          />
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Potongan</Text>
          <Text style={styles.totalValue}>- {formatCurrency(payslip.totalDeductions)}</Text>
        </View>

        <View style={styles.netPayBox}>
          <Text style={styles.netPayLabel}>Gaji Bersih (Take Home Pay)</Text>
          <Text style={styles.netPayValue}>{formatCurrency(payslip.netPay)}</Text>
        </View>

        <Text style={styles.footer}>
          Dokumen ini digenerate otomatis oleh EgaLog HR pada{" "}
          {new Date(payslip.generatedAt).toLocaleString("id-ID")}. Perhitungan BPJS dan
          PPh21 pada slip ini adalah ESTIMASI yang disederhanakan untuk keperluan
          demo/portfolio, bukan perhitungan resmi sesuai peraturan perpajakan dan
          ketenagakerjaan Indonesia yang berlaku.
        </Text>
      </Page>
    </Document>
  );
}
