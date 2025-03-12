from tkinter import Tk, Frame, Label, Button

# Create main window
app = Tk()
app.title("Tkinter Example")
app.geometry("1200x860")
app.configure(bg="#EEE")
app.resizable(False, False)

def main_app():
    def admin_area():
        # Create a side frame for buttons

        side_frame = Frame(app, width=280, height=860, bg="#FFF", relief="flat")
        side_frame.place(x=0, y=0)
        side_frame.pack_propagate(False)  # Prevent auto-resizing

        # Create a label
        label = Label(app, text="Welcome!", font=("Arial", 16, "bold"), bg="lightblue")
        label.place(x=500, y=50)

        def action_one():
            label.config(text="Start Action Executed!")

        # Define button details
        buttons = [
            ("Add Student", action_one, "black"),
            ("Fees Submission", action_one, "black"),
            ("Annoucement", action_one, "black"),
            ("Statics", action_one, "black"),
            ("Webiste", action_one, "black"),
            ("Exit", app.destroy, "black")
        ]

        # Place buttons inside side_frame
        for i, (text, command, color) in enumerate(buttons):
            button = Button(
                side_frame,
                text=text,
                command=command,
                bg=color,
                fg="white",
                activeforeground="white",
                activebackground="orange",
                font=("Arial", 12),
                padx=10,
                pady=5,
            )
            button.place(x=40, y=180 + i * 100, width=200, height=40)
            
        app.mainloop()

    admin_area()        
main_app()

