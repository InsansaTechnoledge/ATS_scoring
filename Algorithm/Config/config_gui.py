import json
import os
import tkinter as tk
from tkinter import ttk, messagebox

class ConfigGUI:
    def __init__(self, config_file='config.json'):
        self.config_file = config_file
        self.config = self.load_config()

    def load_config(self):
        """Load configuration from file."""
        default_config = {
            'min_file_size_kb': 50,
            'max_file_size_mb': 10,
            'min_word_count': 200,
            'max_word_count': 5000,
            'required_sections': ['experience', 'education', 'skills'],
            'forbidden_characters': ['□', '■', '�', '°'],
            'max_image_percentage': 30
        }
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                return {**default_config, **json.load(f)}
        return default_config

    def save_config(self):
        """Save configuration to file."""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=4)
            messagebox.showinfo("Success", "Configuration saved successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save config: {e}")

    def open_gui(self):
        """Open the GUI window to edit settings."""
        window = tk.Tk()
        window.title("ATS Configurations")
        window.geometry("400x500")

        # Create input fields
        fields = {
            "min_file_size_kb": tk.StringVar(value=str(self.config["min_file_size_kb"])),
            "max_file_size_mb": tk.StringVar(value=str(self.config["max_file_size_mb"])),
            "min_word_count": tk.StringVar(value=str(self.config["min_word_count"])),
            "max_word_count": tk.StringVar(value=str(self.config["max_word_count"])),
            "max_image_percentage": tk.StringVar(value=str(self.config["max_image_percentage"])),
            "forbidden_characters": tk.StringVar(value=",".join(self.config["forbidden_characters"])),
            "required_sections": tk.StringVar(value=",".join(self.config["required_sections"]))
        }

        # Labels and Entry fields
        row = 0
        for key, var in fields.items():
            ttk.Label(window, text=key.replace("_", " ").capitalize()).grid(row=row, column=0, padx=10, pady=5, sticky="w")
            ttk.Entry(window, textvariable=var, width=30).grid(row=row, column=1, padx=10, pady=5)
            row += 1

        def save_changes():
            """Save user changes to config.json."""
            try:
                self.config["min_file_size_kb"] = int(fields["min_file_size_kb"].get())
                self.config["max_file_size_mb"] = int(fields["max_file_size_mb"].get())
                self.config["min_word_count"] = int(fields["min_word_count"].get())
                self.config["max_word_count"] = int(fields["max_word_count"].get())
                self.config["max_image_percentage"] = int(fields["max_image_percentage"].get())

                self.config["forbidden_characters"] = fields["forbidden_characters"].get().split(",")
                self.config["required_sections"] = fields["required_sections"].get().split(",")

                self.save_config()
            except ValueError:
                messagebox.showerror("Error", "Please enter valid numerical values!")

        # Save Button
        ttk.Button(window, text="Save", command=save_changes).grid(row=row, column=0, columnspan=2, pady=10)

        window.mainloop()
