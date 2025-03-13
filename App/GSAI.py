from tkinter import Tk, Frame, Label, Button, messagebox
from PIL import Image, ImageTk

# Create the main application window
app = Tk()
app.title("Ghatak Sports Academy India")
app.geometry("1200x860")
app.configure(bg="#FFF")
app.resizable(False, False)

def load_images(image_files):
    """Load images and return a dictionary of PhotoImage objects."""
    images = {}
    for file in image_files:
        try:
            img = Image.open(file)
            images[file] = ImageTk.PhotoImage(img)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load {file}: {e}")
            images[file] = None  # Assign None instead of stopping execution
    return images

def student_management():
    """Displays the student management section."""
    student_frame = Frame(app, width=780, height=760, bg="#FFF", relief="flat")
    student_frame.place(x=370, y=50)

    Label(student_frame, text="New Admission", fg="black", bg="#FFF",
          font=("sans-serif", 18, "bold")).place(x=40, y=40)

    Label(student_frame, text="Fill Details Carefully", fg="black", bg="#FFF",
          font=("sans-serif", 9, "bold")).place(x=40, y=100)

def admin_area():
    """Set up the admin area of the application."""
    app.title("Ghatak Sports Academy India: Admin Section")

    # Load images
    image_files = ["logo.png"]
    images = load_images(image_files)

    # Sidebar Frame
    side_frame = Frame(app, width=310, height=860, bg="orange", relief="flat")
    side_frame.place(x=0, y=0)

    # Add logo if image exists
    if images.get("logo.png"):
        Label(side_frame, image=images["logo.png"], border=0, background="orange").place(x=70, y=50)

    # Footer label
    Label(side_frame, text="Made with ❤ by EllowDigitals",
          font=("Arial", 11, "bold"), bg="orange").place(x=55, y=800)

    # Define button details
    buttons = [
        ("Student Management", student_management),
        ("Student Payment", lambda: messagebox.showinfo("Action", "Student Payment Clicked")),
        ("Publish Announcement", lambda: messagebox.showinfo("Action", "Publish Announcement Clicked")),
        ("View Analytics", lambda: messagebox.showinfo("Action", "View Analytics Clicked")),
        ("Visit Website", lambda: messagebox.showinfo("Action", "Visit Website Clicked")),
        ("Update Application", app.quit)
    ]

    # Create buttons inside the sidebar
    for i, (text, command) in enumerate(buttons):
        Button(side_frame, text=text, command=command,
               bg="#000", fg="#FFF", border=0,
               font=("Arial", 12), relief="flat").place(x=60, y=300 + i * 80, width=200, height=40)
    
    side_frame.mainloop()

def main():
    """Main function to initialize the application."""
    admin_area()
    app.mainloop()

# Run the application
main()
