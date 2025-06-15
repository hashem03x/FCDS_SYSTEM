from docx import Document
import os

def read_document(file_path):
    doc = Document(file_path)
    
    print("\nDocument Content:")
    print("=" * 50)
    
    for i, paragraph in enumerate(doc.paragraphs, 1):
        if paragraph.text.strip():  # Only print non-empty paragraphs
            print(f"\nParagraph {i}:")
            print(paragraph.text)
    
    print("\n\nImages/Graphs:")
    print("=" * 50)
    
    # Get all images in the document
    for i, rel in enumerate(doc.part.rels.values(), 1):
        if "image" in rel.target_ref:
            print(f"\nImage {i}:")
            print(f"Location: {rel.target_ref}")

if __name__ == "__main__":
    doc_path = "final_doc.docx"
    if os.path.exists(doc_path):
        read_document(doc_path)
    else:
        print(f"Error: File {doc_path} not found!") 