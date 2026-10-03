// Camelea-BackEnd/src/processTests/WISC.js: loads only the norm tables needed for the patient's age band (no values included).
// Excerpt from a private codebase, not runnable on its own.

const selection = `tblData.A.${ageRange} tblData.A.${age.years} tblData.A.A2 tblData.A.A3`
const obj = clearEmpt(formData)
const testsData = Object.assign({}, ...Object.keys(obj).map(key => obj[key]));
//we loop through testsData and delete the empty values or undefined values
for (let key in testsData) {
    if (testsData[key] === "" || testsData[key] === undefined) {
        delete testsData[key];
    }
}
testsData.conf = conf;
testsData.seuil = seuil;
const WISCTable = await ScoringTable.findOne({ tblName: "WISC" }).select(selection)
const passationData = Object.keys(obj).filter(key => obj[key] !== undefined).reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
const tblA = WISCTable.tblData['A'][ageRange] //* Table pour obtenir la note Standard et le Score échelonné à partir des données brute
const tblB = WISCTable.tblData['A']['A2'] //* Table pour obtenir le Rang percentile et l'Indice echelloné à partir des Scores échelonnés
const tblC = WISCTable.tblData['A']['A3'] //* Table pour obtenir l'age équivalent à partir des *données brute
const tblD = WISCTable.tblData['A'][`${age.years}`] //* Table pour obtenir l'age équivalent à partir des données brute
