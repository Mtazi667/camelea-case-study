// Camelea-BackEnd/src/utils/updateTests.js: re-scores only the tests affected when a patient's birthdate or gender changes.
// Excerpt from a private codebase, not runnable on its own.

const updateTests = async ({ fetchPatient, prevBirthdate, prevGender }) => {
    try {
        const updatedTests = {
            success: [],
            failed: [],
            ignored: []
        }
        const requiresUpdate = {
            age: Math.abs(prevBirthdate - fetchPatient.birthdate.getTime()) > 604800000,
            gender: prevGender !== fetchPatient.gender
        }
        const orSelector = []
        for (let key in requiresUpdate) {
            if (requiresUpdate[key])
                orSelector.push({ [`update.${key}`]: true })
        }
        const addedTests = Array.from(fetchPatient.bilansData.keys())
        const tests = await TestProps.find({ name: { $in: addedTests }, $or: orSelector }).select('-_id -access')
        const arr = tests.map(({ name }) => name)
        for (let test of addedTests) {
            if (!arr.includes(test))
                updatedTests.ignored.push(test)
        }
        if (tests.length === 0) return updatedTests
        for (let test of tests) {
            const { name: testName, type: testType, multiple: isMultiple } = test
            const currentTest = fetchPatient.testsData.get(testName)
            const passation = currentTest?.datePassation ? new Date(currentTest.datePassation) : new Date();
            //* Age in years and months
            //? New Age
            const ageInYears = (passation.getFullYear() - (fetchPatient.birthdate).getFullYear())
            const ageInMonths = (passation.getFullYear() - (fetchPatient.birthdate).getFullYear()) * 12 + (passation.getMonth() - (fetchPatient.birthdate).getMonth())
            const birthdate = new Date(fetchPatient.birthdate);
            const ageDiff = passation - birthdate;
            const ageDate = new Date(ageDiff);
            const years = Math.abs(ageDate.getUTCFullYear() - 1970);
            const months = ageDate.getUTCMonth();
            const days = ageDate.getUTCDate();
            //? Previous Age
            const prevAgeInYears = (passation.getFullYear() - (prevBirthdate).getFullYear())
            const prevAgeInMonths = (passation.getFullYear() - (prevBirthdate).getFullYear()) * 12 + (passation.getMonth() - (prevBirthdate).getMonth())
            const prevAgeDiff = passation - prevBirthdate;
            const prevAgeDate = new Date(prevAgeDiff);
            const prevYears = Math.abs(prevAgeDate.getUTCFullYear() - 1970);
            const prevMonths = prevAgeDate.getUTCMonth();
            const prevDays = prevAgeDate.getUTCDate();
            if (testType === "Test" || !isMultiple) {
                try {
                    const body = testType === "Test" ? currentTest : { resData: currentTest.tstData }
                    const updatedTest = await processTest[testName]({ body, ageInMonths, ageInYears, birth_date: fetchPatient.birthdate, age: { years, months, days }, prevAgeInMonths, prevAgeInYears, prevBirthdate, prevAge: { years: prevYears, months: prevMonths, days: prevDays }, gender: fetchPatient.gender, prevGender, testName, action: "UPDATE" });
                    if (updatedTest) {
                        fetchPatient.bilansData.set(testName, updatedTest.bilansData)
                        updatedTests.success.push(testName)
                    }
                    else
                        updatedTests.ignored.push(testName)
                } catch (error) {
                    updatedTests.failed.push({ testName, error })
                }
            }
            else {
                for (let evalType in currentTest.tstData) {
                    if (currentTest.tstData.hasOwnProperty(evalType)) {
                        try {
                            const body = { resData: currentTest.tstData[`${evalType}`], evalType, parent: evalType }
                            const updatedTest = await processTest[testName]({ body, ageInMonths, ageInYears, birth_date: fetchPatient.birthdate, age: { years, months }, prevAgeInMonths, prevAgeInYears, prevBirthdate, prevAge: { prevYears, prevMonths }, gender: fetchPatient.gender, prevGender, testName, action: "UPDATE" });
                            if (!updatedTest) {
                                updatedTests.ignored.push(testName)
                                break;
                            }
                            fetchPatient.bilansData.set(testName,
                                {
                                    ...fetchPatient.bilansData.get(testName),
                                    ...updatedTest.bilansData
                                })
                            if (!updatedTests.success.includes(testName))
                                updatedTests.success.push(testName)
                        } catch (error) {
                            updatedTests.failed.push({ testName, error })
                        }

                    }

                }
            }
        }
        return updatedTests
    } catch (error) {
        throw error;
    }
}
