# Bilans-API/process.py: assembles the report by category and filters tests for the school version.
# Excerpt from a private codebase, not runnable on its own.

# *------------------------------------------Insert Data---------------------------------------------
for key in categories:
    if key == "ECA":
        titb = doc.add_paragraph()
        titb.add_run(categories["ADD"][0], style="Tit").alignment = 1
        titb.alignment = 1
        titc = doc.add_paragraph()
        titc.add_run(categories["ADD"][1], style="Tit").alignment = 1
        titc.alignment = 1
    if key == "ADD":
        continue
    # we veriify if at least one of the element of the array categories[key]["Test"] is found in list(self.main_docs.keys()) if yes we return true
    if any(i in categories[key]["Tests"] for i in list(self.main_docs.keys())):
        tit = doc.add_paragraph()
        tit.add_run(categories[key]["Title"].split(' - ')[0], style="Tit").alignment = 1
        tit.alignment = 1
        for test in categories[key]["Tests"]:
            if self.type != "Complet" and test not in [
                "WISC-V",
                "WAIS-IV",
                "KITAP",
                "TAP",
                "DTVP-3",
                "DTVP-A-2",
            ]:
                continue
            if test in list(self.main_docs.keys()):
                data_to_doc.process(
                    doc,
                    test,
                    self.main_docs[test],
                    self.langue,
                    self.info["firstName"],
                    skip=True if self.type != "Complet" else False,
                )
                doc.add_page_break()
