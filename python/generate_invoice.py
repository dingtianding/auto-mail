import json
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_invoice(data_file, output_path):
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30
    ))
    
    # Build content
    elements = []
    
    # Header
    elements.append(Paragraph("INVOICE", styles['CustomTitle']))
    elements.append(Paragraph(f"Invoice #: {data['invoice_number']}", styles['Normal']))
    elements.append(Paragraph(f"Date: {data['date']}", styles['Normal']))
    elements.append(Paragraph(f"Due Date: {data['due_date']}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Customer info
    elements.append(Paragraph("Bill To:", styles['Heading3']))
    elements.append(Paragraph(data['customer']['name'], styles['Normal']))
    elements.append(Paragraph(data['customer']['address'], styles['Normal']))
    elements.append(Paragraph(data['customer']['email'], styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Line items
    table_data = [['Item', 'Description', 'Quantity', 'Rate', 'Amount']]
    for item in data['line_items']:
        table_data.append([
            item['service'],
            item['description'],
            str(item['quantity']),
            f"${item['rate']:.2f}",
            f"${item['total']:.2f}"
        ])
    
    # Add totals
    table_data.extend([
        ['', '', '', 'Subtotal:', f"${data['subtotal']:.2f}"],
        ['', '', '', f"Tax ({data['tax_rate']*100:.1f}%):", f"${data['tax_amount']:.2f}"],
        ['', '', '', 'Total:', f"${data['total_amount']:.2f}"]
    ])
    
    table = Table(table_data, colWidths=[2*inch, 2*inch, inch, inch, 1.25*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, -3), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, -3), (-1, -1), colors.black),
        ('FONTNAME', (-2, -3), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    
    # Notes
    if data.get('notes'):
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("Notes:", styles['Heading3']))
        elements.append(Paragraph(data['notes'], styles['Normal']))
    
    # Generate PDF
    doc.build(elements)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python generate_invoice.py <data_file> <output_path>")
        sys.exit(1)
    
    generate_invoice(sys.argv[1], sys.argv[2])