from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import json
import sys

def generate_letter(data_file, output_path):
    # Load customer data
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    # Create PDF
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Add letterhead
    story.append(Paragraph(f"Letter for: {data['name']}", styles['Title']))
    story.append(Paragraph(f"Address: {data['address']}", styles['Normal']))
    story.append(Paragraph(f"Date: {data['date']}", styles['Normal']))
    story.append(Paragraph(data['message'], styles['Normal']))
    
    # Generate PDF
    doc.build(story)
    return output_path

if __name__ == "__main__":
    generate_letter(sys.argv[1], sys.argv[2]) 