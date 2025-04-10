from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import json
import sys
from datetime import datetime
import os

class LetterGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        # Create custom style for letterhead
        self.styles.add(ParagraphStyle(
            name='Letterhead',
            fontSize=14,
            textColor=colors.navy,
            spaceAfter=30
        ))

    def validate_data(self, data):
        required_fields = ['name', 'address', 'message']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

    def generate_letter(self, data_file, output_path):
        try:
            # Load and validate customer data
            with open(data_file, 'r') as f:
                data = json.load(f)
            self.validate_data(data)
            
            # Create output directory if it doesn't exist
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Create PDF
            doc = SimpleDocTemplate(
                output_path,
                pagesize=letter,
                topMargin=inch,
                bottomMargin=inch,
                leftMargin=inch,
                rightMargin=inch
            )
            
            story = []
            
            # Add company letterhead
            story.append(Paragraph("Your Company Name", self.styles['Letterhead']))
            story.append(Spacer(1, 12))
            
            # Add date
            current_date = data.get('date', datetime.now().strftime("%B %d, %Y"))
            story.append(Paragraph(f"Date: {current_date}", self.styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Add recipient details
            story.append(Paragraph(f"Dear {data['name']},", self.styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Add address block
            address_lines = data['address'].split(',')
            for line in address_lines:
                story.append(Paragraph(line.strip(), self.styles['Normal']))
            story.append(Spacer(1, 24))
            
            # Add message content
            story.append(Paragraph(data['message'], self.styles['Normal']))
            story.append(Spacer(1, 24))
            
            # Add signature
            story.append(Paragraph("Sincerely,", self.styles['Normal']))
            story.append(Spacer(1, 36))
            story.append(Paragraph("Your Name", self.styles['Normal']))
            
            # Generate PDF
            doc.build(story)
            return output_path
            
        except FileNotFoundError:
            raise FileNotFoundError(f"Data file not found: {data_file}")
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON format in file: {data_file}")
        except Exception as e:
            raise Exception(f"Error generating letter: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_letter.py <data_file> <output_path>")
        sys.exit(1)
        
    generator = LetterGenerator()
    try:
        output_file = generator.generate_letter(sys.argv[1], sys.argv[2])
        print(f"Letter generated successfully: {output_file}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1) 