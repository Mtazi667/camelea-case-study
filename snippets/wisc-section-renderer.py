# Bilans-API/data_to_doc.py: renders the WISC-V section of a report (tables, plots, prorata and substitution notices).
# Excerpt from a private codebase, not runnable on its own.

def WISC(self):
    og_data = copy.deepcopy(self.data[1:])
    formated_data = format_WISC(self.data[1:], self.langue)
    translation = formated_data["Translation"]
    Keys_Values = formated_data["Keys_Values"]
    plot_title = formated_data["Plot_Title"]
    self.doc.sections[0].left_margin = Inches(0.6)
    self.doc.sections[0].right_margin = Inches(0.6)
    title = self.doc.add_heading("WISC-V ", 0)
    title.alignment = 1
    self.doc.add_paragraph().add_run(
        formated_data["Test_Description"], style="Description"
    )
    for elem in formated_data["Data"]:
        if not isinstance(elem, dict) or "name" not in list(elem.keys()):
            continue
        p = [i for i, x in enumerate(og_data) if x["name"] == elem["name"]][0]
        og_data_cpy = og_data[p]["table"].copy()
        col = elem["Column"]
        self.doc.add_heading(elem["name"])
        merge = None if "Merge" not in elem else elem["Merge"]
        col_width = None if "Column_Width" not in elem else elem["Column_Width"]
        addTable(
            self.doc,
            elem["table"],
            col=col,
            Merge=merge,
            col_width=col_width,
        )
        if self.skip:
            break
        if "Comment" in elem:
            self.doc.add_paragraph().add_run(elem["Comment"])
        if "Subtests" == elem["name"]:
            img = WISC_Subtest_Plot(
                og_data_cpy,
                Keys_Values,
                translation,
                self.langue,
                plot_title["Subtests"],
            )
            self.doc.add_picture(img, width=Inches(7))
            last_paragraph = self.doc.paragraphs[-1]
            last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if "Composite" in elem["name"]:
            img = WISC_Composite_Plot(
                og_data_cpy, translation, self.langue, plot_title["Composite"]
            )
            qit_status = self.data[0]['QIT']
            if qit_status["exists"]:
                with open("format_data.json", "r", encoding="utf-8") as f:
                    json_data = json.load(f)["WISC-V"]
                if qit_status["prorata"]:
                    self.doc.add_paragraph().add_run(json_data["QIT"][self.langue]["Prorata"], style="Warning")
                if qit_status["substitution"]:
                    self.doc.add_paragraph().add_run(json_data["QIT"][self.langue]["Substitution"], style="Warning")
            self.doc.add_picture(img, width=Inches(6.5))
            last_paragraph = self.doc.paragraphs[-1]
            last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
