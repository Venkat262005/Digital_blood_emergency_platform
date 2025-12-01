import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportDonorPdf(donor) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Donor Details", 14, 20);

  doc.setFontSize(11);
  const lines = [
    `Name: ${donor.name || ""}`,
    `Age / Gender: ${donor.age || "-"} / ${donor.gender || "-"}`,
    `Blood Group: ${donor.bloodGroup || "-"}`,
    `Phone: ${donor.phone || "-"}`,
    `City: ${donor.city || "-"}`,
    `Last Donation Date: ${donor.lastDonationDate || "-"}`,
    `Availability: ${donor.availabilityStatus || "-"}`,
    `Notes: ${donor.notes || "-"}`,
  ];

  let y = 30;
  lines.forEach((line) => {
    doc.text(line, 14, y);
    y += 8;
  });

  doc.save(`donor-${donor.id || "details"}.pdf`);
}

export async function exportRequestPdf(request) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Emergency Blood Request", 14, 20);

  doc.setFontSize(11);
  const lines = [
    `Patient Name: ${request.patientName || ""}`,
    `Blood Group: ${request.bloodGroup || "-"}`,
    `Units Required: ${request.unitsRequired || "-"}`,
    `Urgency: ${request.urgency || "-"}`,
    `Status: ${request.status || "-"}`,
    `Hospital: ${request.hospital || "-"}`,
    `City: ${request.city || "-"}`,
    `Contact: ${request.contactNumber || "-"}`,
    `Created At: ${request.createdAt || "-"}`,
    `Notes: ${request.notes || "-"}`,
  ];

  let y = 30;
  lines.forEach((line) => {
    doc.text(line, 14, y);
    y += 8;
  });

  doc.save(`request-${request.id || "details"}.pdf`);
}

// Example for future: export arbitrary HTML element
export async function exportElementToPdf(elementId, filename = "export.pdf") {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
