from tkinter import *
from tkinter import messagebox
from PIL import Image, ImageTk

# Initialize main window
app = Tk()
app.title("Ghatak Sports Academy India")
app.configure(bg="#EEE")
app.resizable(False, False)
app.overrideredirect(True)

# Set window size and position
WINDOW_WIDTH, WINDOW_HEIGHT = 1200, 860
SCREEN_WIDTH, SCREEN_HEIGHT = app.winfo_screenwidth(), app.winfo_screenheight()
X_POSITION, Y_POSITION = (
    SCREEN_WIDTH - WINDOW_WIDTH) // 2, (SCREEN_HEIGHT - WINDOW_HEIGHT) // 2
app.geometry(f"{WINDOW_WIDTH}x{WINDOW_HEIGHT}+{X_POSITION}+{Y_POSITION}")

# Load images


def load_images(image_files):
    images = {}
    for file in image_files:
        try:
            img = Image.open(file)
            images[file] = ImageTk.PhotoImage(img)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load {file}: {e}")
            images[file] = None
    return images


image_files = ["logo.png", "instagram.png", "facebook.png",
               "google-maps.png"] + [f"slider{i}.png" for i in range(1, 7)]
images = load_images(image_files)

# Image resizing function


def resize_image(img, target_size=(700, 340)):
    img.thumbnail(target_size, Image.LANCZOS)
    new_img = Image.new("RGB", target_size, (255, 255, 255))
    new_img.paste(
        img, ((target_size[0] - img.width) // 2, (target_size[1] - img.height) // 2))
    return new_img


slider_images = [ImageTk.PhotoImage(resize_image(
    Image.open(img))) for img in image_files if "slider" in img]

# Function to switch images in slider


def update_image(index=0):
    if slider_images:
        slider_label.config(image=slider_images[index])
        app.after(2000, lambda: update_image((index + 1) % len(slider_images)))

# Admin Area


def admin_area():
    for widget in app.winfo_children():
        widget.destroy()

    side_frame = Frame(app, width=310, height=860, bg="#FFF", relief="flat")
    side_frame.place(x=0, y=0)

    Label(side_frame, text="Made with ❤ by EllowDigitals", font=(
        "Arial", 11, "bold"), bg="#FCFCFC", fg="#0096FF").place(x=55, y=750)

    buttons = [
        ("Student Management", lambda: messagebox.showinfo(
            "Action", "Student Management Clicked")),
        ("Student Payment", lambda: messagebox.showinfo(
            "Action", "Student Payment Clicked")),
        ("View Analytics", lambda: messagebox.showinfo(
            "Action", "View Analytics Clicked")),
        ("Change Password", lambda: messagebox.showinfo(
            "Action", "Change Password Clicked")),
        ("Update Application", lambda: messagebox.showinfo(
            "Action", "Update Clicked")),
        ("Close Application", app.quit),
    ]

    for i, (text, command) in enumerate(buttons):
        Button(side_frame, text=text, command=command, bg="#000", fg="#FFF", border=0, font=(
            "Arial", 12), relief="flat").place(x=60, y=100 + i * 80, width=200, height=40)

    for idx, img in enumerate(["instagram.png", "facebook.png", "google-maps.png"]):
        if images.get(img):
            Button(side_frame, image=images[img], border=0, background="#FFF").place(
                x=70 + (idx * 70), y=650)

    intro_frame = Frame(app, width=780, height=760, bg="#FFF", relief="flat")
    intro_frame.place(x=370, y=50)

    Label(intro_frame, text="Ghatak Sports Academy India", font=(
        "Arial", 20, "bold"), bg="#FCFCFC", fg="red").place(x=200, y=50)
    Label(intro_frame, text="Ghatak Sports Academy India (GSAI) is dedicated to excellence in martial arts and self-defense.\n"
          "We combine traditional techniques with modern training to help you achieve your full potential\n"
          "in a disciplined, respectful environment.", wraplength=580, justify="center", font=("Arial", 14, 'bold'), bg="#FFF").place(x=140, y=120)
    Label(intro_frame, text="Founded by Nitesh Yadav in 2025", font=(
        "Arial", 12, "bold"), fg="blue", bg="#FFF").place(x=260, y=250)

    global slider_label
    slider_label = Label(intro_frame, bg="#FFF")
    slider_label.place(x=37, y=360, width=700, height=340)
    if slider_images:
        update_image()

# Login Screen


def login_screen():
    for widget in app.winfo_children():
        widget.destroy()

    login_frame = Frame(app, width=WINDOW_WIDTH,
                        height=WINDOW_HEIGHT, bg="#FFBF00")
    login_frame.place(x=0, y=0)

    details_frame = Frame(login_frame, width=1000, height=400, bg="#FFF")
    details_frame.place(x=100, y=240)

    Label(details_frame, text="Ghatak Sports Academy India", font=(
        "Arial", 20, "bold"), bg="#FFF", fg="red").place(x=500, y=30)
    Label(details_frame, text="Admin Login", font=(
        "Arial", 16, "bold"), bg="#FFF").place(x=500, y=90)
    Label(details_frame, text="Username", font=("Arial", 12),
          bg="#FFF", fg="#FFBF00").place(x=500, y=130)
    Label(details_frame, text="Password", font=("Arial", 12),
          bg="#FFF", fg="#FFBF00").place(x=500, y=210)

    username_entry = Entry(details_frame, font=(
        "Arial", 12), bg="#EEE", fg="#000", relief="flat")
    username_entry.place(x=500, y=170, width=250, height=30)

    password_entry = Entry(details_frame, font=(
        "Arial", 12), bg="#EEE", fg="#000", relief="flat", show="*")
    password_entry.place(x=500, y=250, width=250, height=30)

    Button(details_frame, text="Login", bg="#000", fg="#FFF", font=("Arial", 12),
           relief="flat", command=admin_area).place(x=500, y=320, width=250, height=40)

    if images.get("logo.png"):
        Label(login_frame, image=images["logo.png"],
              border=0, background="#FFF").place(x=220, y=330)


# Run application
login_screen()
app.mainloop()
