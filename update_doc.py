from docx import Document
import os

def update_document(file_path):
    doc = Document(file_path)
    
    # Dictionary to store graph locations and their page numbers
    graph_pages = {
        "image1.png": "Page 1",
        "image13.png": "Page 15",
        "image12.png": "Page 16",
        "image11.png": "Page 18",
        "image10.png": "Page 19",
        "image9.png": "Page 20",
        "image8.png": "Page 21",
        "image7.png": "Page 22",
        "image6.png": "Page 23",
        "image5.png": "Page 24",
        "image4.png": "Page 25",
        "image3.png": "Page 26",
        "image2.png": "Page 27"
    }
    
    # Add page numbers to the document
    for paragraph in doc.paragraphs:
        for image_name, page_num in graph_pages.items():
            if image_name in paragraph.text:
                # Add page number after the image reference
                paragraph.text = f"{paragraph.text} ({page_num})"
    
    # Save the updated document
    output_path = "final_doc_updated.docx"
    doc.save(output_path)
    print(f"Updated document saved as: {output_path}")

if __name__ == "__main__":
    doc_path = "final_doc.docx"
    if os.path.exists(doc_path):
        update_document(doc_path)
    else:
        print(f"Error: File {doc_path} not found!") 