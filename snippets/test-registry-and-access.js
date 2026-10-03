// Camelea-BackEnd/src/controllers/fillTests/fillTestsController.js: test registry and per-role, per-test access check before scoring.
// Excerpt from a private codebase, not runnable on its own.

const processTest = {
    "BISHOP": processBISHOP,
    "BRIEF": processBRIEF,
    "BRIEF-A": processBRIEFA,
    "CAARS": processCAARS,
    "DTVP-A-2": processDTVP2,
    "DTVP-3": processDTVP3,
    "EQ-AQ-SQ": processEqAqSq,
    "EQ-AQ-SQ-A": processEqAqSq,
    "HIPIC": processHIPIC,
    "NEPSY-II": processNEPSY,
    "RCMAS": processRCMAS,
    "SCQ": processSCQ,
    "WISC-V": processWISC,
    "WAIS-IV": processWAIS,
    "KITAP": processKITAP_TAP,
    "TAP": processKITAP_TAP,
    "Vineland-II": processVineland,
    "BB5": processBB5,
    "SON-R": processSonR,
    "WPPSI-IV": processWPPSI,
    "TGMD-2": processTgmd2,
    "WCST": processWcst
}
const fillTest = async (data) => {
    try {
        const { id, body } = data;
        const { patientID, testName, datePassation, evalType } = body;
        const fetchUser = await User.findOne({ _id: id });
        const fetchPatient = await Patient.findOne({ _id: patientID })
        const testProps = await TestProps.findOne({ name: testName });
        const userRole = fetchUser.role
        const userAcces = fetchUser.acces
        const accessProps = testProps.access[userRole];
        if (!accessProps.allowed || !fetchPatient.allTest.includes(testName)) {
            throw Error('Unauthorized!')
        }
        else if (accessProps?.isSu) { }
        else {
            if (accessProps?.isParent) {
                if (!userAcces.includes(testName) || !fetchUser.patients.includes(patientID))
                    throw Error('Unauthorized!')
            }
            else {
                if (accessProps?.acces) {
                    if (!userAcces.includes(accessProps?.acces))
                        throw Error('Unauthorized!')
                }
                if (accessProps?.chackParent) {
                    const parentID = fetchUser.parent
                    const fetchParent = await User.findOne({ _id: parentID })
                    if (!fetchParent.acces.includes(testName) || !fetchParent.patients.includes(patientID)) {
                        throw Error('Unauthorized!')
                    }
                }
            }
        }
        const passation = datePassation ? new Date(datePassation) : new Date();
        const ageInYears = (passation.getFullYear() - (fetchPatient.birthdate).getFullYear())
        const ageInMonths = (passation.getFullYear() - (fetchPatient.birthdate).getFullYear()) * 12 + (passation.getMonth() - (fetchPatient.birthdate).getMonth())
        const birthdate = new Date(fetchPatient.birthdate);
        const ageDiff = passation - birthdate;
        const ageDate = new Date(ageDiff);
        const years = Math.abs(ageDate.getUTCFullYear() - 1970);
        const months = ageDate.getUTCMonth();
        const days = ageDate.getUTCDate();
        const process = await processTest[testName]({ body, gender: fetchPatient.gender, ageInMonths, ageInYears, birth_date: fetchPatient.birthdate, age: { years, months, days }, action: "FILL" });
