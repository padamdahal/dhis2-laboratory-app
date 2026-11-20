import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.use(express.json());

/* ============================================================================
   In-memory DHIS2 API stub for local preview in AI Studio.
   Keeps src/index.html untouched while allowing the Laboratory app to boot
   and exercise its full workflow (worklist, collection, results, verification,
   and walk-in direct tests) without a live DHIS2 backend.
   ============================================================================ */
function generateUid() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const alnum = letters + "0123456789";
  let uid = letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 10; i++) {
    uid += alnum.charAt(Math.floor(Math.random() * alnum.length));
  }
  return uid;
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const ORG_UNIT_UID = "ouFacility01";
const PROGRAM_UID = "progEphc001";
const STAGE_ORDER = "stgOrd00001";
const STAGE_OPD = "stgOpd00001";
const STAGE_ANC = "stgAnc00001";
const STAGE_LAB = "stgLab00001";
const GROUP_SET_UID = "degsLabTest";

const DE = {
  orders: "deOrders001",
  labOrders: "deLabOrd001",
  status: "deStatus001",
  sampleId: "deSampId001",
  sampleType: "deSampTp001",
  orderEvent: "deOrdEvt001",
  requestedFrom: "deReqFrm001",
  verifiedBy: "deVerBy0001",
  verifiedDate: "deVerDt0001",
  // Result data elements
  hb: "deResHb0001",
  wbc: "deResWbc001",
  platelets: "deResPlt001",
  rbs: "deResRbs001",
  urineProtein: "deResUpr001",
  urineGlucose: "deResUgl001",
};

const ATTR = {
  firstName: "attrFirst01",
  middleName: "attrMid0001",
  lastName: "attrLast001",
  patientId: "attrPatId01",
  dob: "attrDob0001",
  sex: "attrSex0001",
};

const labConfig = {
  apiBaseUrl: "/ephc/api",
  programUid: PROGRAM_UID,
  orderStageUid: STAGE_ORDER,
  laboratoryStageUid: STAGE_LAB,
  testGroupSetUid: GROUP_SET_UID,
  orgUnitUid: ORG_UNIT_UID,
  orgUnitMode: "SELECTED",
  sampleId: { prefix: "LAB", separator: "-", sequenceDigits: 6 },
  sampleTypes: [
    { code: "BLOOD", name: "Whole Blood (EDTA)" },
    { code: "SERUM", name: "Serum" },
    { code: "URINE", name: "Urine" },
  ],
  patientAttributes: ATTR,
  dataElements: {
    orders: DE.orders,
    labOrders: DE.labOrders,
    status: DE.status,
    sampleId: DE.sampleId,
    sampleType: DE.sampleType,
    orderEvent: DE.orderEvent,
    requestedFrom: DE.requestedFrom,
    verifiedBy: DE.verifiedBy,
    verifiedDate: DE.verifiedDate,
  },
};

const programStages = [
  { id: STAGE_ORDER, name: "Laboratory Order", shortName: "Lab Order", displayName: "Laboratory Order", displayShortName: "Lab Order" },
  { id: STAGE_OPD, name: "Outpatient Department (OPD)", shortName: "OPD", displayName: "Outpatient Department (OPD)", displayShortName: "OPD" },
  { id: STAGE_ANC, name: "Antenatal Care (ANC)", shortName: "ANC", displayName: "Antenatal Care (ANC)", displayShortName: "ANC" },
  { id: STAGE_LAB, name: "Laboratory", shortName: "Laboratory", displayName: "Laboratory", displayShortName: "Laboratory" },
];

const testGroupSet = {
  id: GROUP_SET_UID,
  dataElementGroups: [
    {
      id: "degCbc00001",
      code: "CBC",
      name: "Complete Blood Count (CBC)",
      shortName: "CBC",
      displayName: "Complete Blood Count (CBC)",
      displayShortName: "CBC",
      description: "SAMPLE:BLOOD",
      dataElements: [
        { id: DE.hb, name: "Hemoglobin (Hb)", shortName: "Hemoglobin", displayName: "Hemoglobin (Hb)", displayShortName: "Hemoglobin", description: "UNIT:g/dL,RANGE:12.0-16.5" },
        { id: DE.wbc, name: "White Blood Cell Count (WBC)", shortName: "WBC", displayName: "White Blood Cell Count (WBC)", displayShortName: "WBC", description: "UNIT:10^3/uL,RANGE:4.0-11.0" },
        { id: DE.platelets, name: "Platelets", shortName: "Platelets", displayName: "Platelets", displayShortName: "Platelets", description: "UNIT:10^3/uL,RANGE:150-450" },
      ],
    },
    {
      id: "degRbs00001",
      code: "RBS",
      name: "Random Blood Sugar (RBS)",
      shortName: "Blood Sugar (RBS)",
      displayName: "Random Blood Sugar (RBS)",
      displayShortName: "Blood Sugar (RBS)",
      description: "SAMPLE:SERUM",
      dataElements: [
        { id: DE.rbs, name: "Random Blood Glucose", shortName: "Glucose", displayName: "Random Blood Glucose", displayShortName: "Glucose", description: "UNIT:mg/dL,RANGE:70-140" },
      ],
    },
    {
      id: "degUrine001",
      code: "URINE",
      name: "Urinalysis (Dipstick)",
      shortName: "Urinalysis",
      displayName: "Urinalysis (Dipstick)",
      displayShortName: "Urinalysis",
      description: "SAMPLE:URINE",
      dataElements: [
        { id: DE.urineProtein, name: "Urine Protein", shortName: "Protein", displayName: "Urine Protein", displayShortName: "Protein", description: "UNIT:,RANGE:Negative" },
        { id: DE.urineGlucose, name: "Urine Glucose", shortName: "Urine Glucose", displayName: "Urine Glucose", displayShortName: "Urine Glucose", description: "UNIT:,RANGE:Negative" },
      ],
    },
  ],
};

const trackedEntities = [
  {
    trackedEntity: "teiPat00001",
    attributes: [
      { attribute: ATTR.firstName, displayName: "First name", value: "Asha" },
      { attribute: ATTR.lastName, displayName: "Last name", value: "Thapa" },
      { attribute: ATTR.patientId, displayName: "Patient ID", value: "PT-1001" },
      { attribute: ATTR.dob, displayName: "Date of birth", value: "1992-04-12" },
      { attribute: ATTR.sex, displayName: "Sex", value: "Female" },
    ],
    enrollments: [{ enrollment: "enrPat00001", program: PROGRAM_UID, status: "ACTIVE", orgUnit: ORG_UNIT_UID }],
    orgUnits: [ORG_UNIT_UID],
  },
  {
    trackedEntity: "teiPat00002",
    attributes: [
      { attribute: ATTR.firstName, displayName: "First name", value: "Bikash" },
      { attribute: ATTR.lastName, displayName: "Last name", value: "Gurung" },
      { attribute: ATTR.patientId, displayName: "Patient ID", value: "PT-1002" },
      { attribute: ATTR.dob, displayName: "Date of birth", value: "1984-11-03" },
      { attribute: ATTR.sex, displayName: "Sex", value: "Male" },
    ],
    enrollments: [{ enrollment: "enrPat00002", program: PROGRAM_UID, status: "ACTIVE", orgUnit: ORG_UNIT_UID }],
    orgUnits: [ORG_UNIT_UID],
  },
  {
    trackedEntity: "teiPat00003",
    attributes: [
      { attribute: ATTR.firstName, displayName: "First name", value: "Sita" },
      { attribute: ATTR.lastName, displayName: "Last name", value: "Karki" },
      { attribute: ATTR.patientId, displayName: "Patient ID", value: "PT-1003" },
      { attribute: ATTR.dob, displayName: "Date of birth", value: "1996-08-21" },
      { attribute: ATTR.sex, displayName: "Sex", value: "Female" },
    ],
    enrollments: [{ enrollment: "enrPat00003", program: PROGRAM_UID, status: "ACTIVE", orgUnit: ORG_UNIT_UID }],
    orgUnits: [ORG_UNIT_UID],
  },
];

let trackerEvents = [
  // Order 1: Awaiting sample collection (ORDERED)
  {
    event: "evtOrd00001",
    occurredAt: daysAgoIso(0),
    program: PROGRAM_UID,
    programStage: STAGE_ORDER,
    trackedEntity: "teiPat00001",
    enrollment: "enrPat00001",
    orgUnit: ORG_UNIT_UID,
    status: "ACTIVE",
    dataValues: [
      { dataElement: DE.orders, value: JSON.stringify(["CBC", "RBS"]) },
      { dataElement: DE.requestedFrom, value: "OPD" },
    ],
  },
  // Order 2: Sample collected & results entered, awaiting verification (COMPLETED)
  {
    event: "evtOrd00002",
    occurredAt: daysAgoIso(1),
    program: PROGRAM_UID,
    programStage: STAGE_ORDER,
    trackedEntity: "teiPat00002",
    enrollment: "enrPat00002",
    orgUnit: ORG_UNIT_UID,
    status: "ACTIVE",
    dataValues: [
      { dataElement: DE.orders, value: JSON.stringify(["RBS"]) },
      { dataElement: DE.requestedFrom, value: "OPD" },
    ],
  },
  {
    event: "evtLab00002",
    occurredAt: daysAgoIso(1),
    program: PROGRAM_UID,
    programStage: STAGE_LAB,
    trackedEntity: "teiPat00002",
    enrollment: "enrPat00002",
    orgUnit: ORG_UNIT_UID,
    status: "ACTIVE",
    dataValues: [
      { dataElement: DE.sampleId, value: "LAB-20261119-004821" },
      { dataElement: DE.sampleType, value: "SERUM" },
      { dataElement: DE.status, value: "COMPLETED" },
      { dataElement: DE.orderEvent, value: "evtOrd00002" },
      { dataElement: DE.labOrders, value: JSON.stringify(["RBS"]) },
      { dataElement: DE.rbs, value: "162" },
    ],
  },
  // Order 3: Verified ANC order (VERIFIED)
  {
    event: "evtOrd00003",
    occurredAt: daysAgoIso(2),
    program: PROGRAM_UID,
    programStage: STAGE_ORDER,
    trackedEntity: "teiPat00003",
    enrollment: "enrPat00003",
    orgUnit: ORG_UNIT_UID,
    status: "ACTIVE",
    dataValues: [
      { dataElement: DE.orders, value: JSON.stringify(["CBC", "URINE"]) },
      { dataElement: DE.requestedFrom, value: "ANC" },
    ],
  },
  {
    event: "evtLab00003",
    occurredAt: daysAgoIso(2),
    program: PROGRAM_UID,
    programStage: STAGE_LAB,
    trackedEntity: "teiPat00003",
    enrollment: "enrPat00003",
    orgUnit: ORG_UNIT_UID,
    status: "COMPLETED",
    dataValues: [
      { dataElement: DE.sampleId, value: "LAB-20261118-003194" },
      { dataElement: DE.sampleType, value: "BLOOD" },
      { dataElement: DE.status, value: "VERIFIED" },
      { dataElement: DE.orderEvent, value: "evtOrd00003" },
      { dataElement: DE.labOrders, value: JSON.stringify(["CBC"]) },
      { dataElement: DE.hb, value: "12.8" },
      { dataElement: DE.wbc, value: "6.9" },
      { dataElement: DE.platelets, value: "240" },
      { dataElement: DE.verifiedBy, value: "lab.supervisor" },
      { dataElement: DE.verifiedDate, value: daysAgoIso(2) + "T10:15:00.000Z" },
    ],
  },
  {
    event: "evtLab00004",
    occurredAt: daysAgoIso(2),
    program: PROGRAM_UID,
    programStage: STAGE_LAB,
    trackedEntity: "teiPat00003",
    enrollment: "enrPat00003",
    orgUnit: ORG_UNIT_UID,
    status: "COMPLETED",
    dataValues: [
      { dataElement: DE.sampleId, value: "LAB-20261118-003195" },
      { dataElement: DE.sampleType, value: "URINE" },
      { dataElement: DE.status, value: "VERIFIED" },
      { dataElement: DE.orderEvent, value: "evtOrd00003" },
      { dataElement: DE.labOrders, value: JSON.stringify(["URINE"]) },
      { dataElement: DE.urineProtein, value: "Negative" },
      { dataElement: DE.urineGlucose, value: "Negative" },
      { dataElement: DE.verifiedBy, value: "lab.supervisor" },
      { dataElement: DE.verifiedDate, value: daysAgoIso(2) + "T10:18:00.000Z" },
    ],
  },
];

function createDhis2Router() {
  const router = express.Router();

  router.get("/dataStore/laboratory/config", (_req, res) => {
    res.json(labConfig);
  });

  router.get("/me.json", (_req, res) => {
    res.json({
      username: "lab.tech",
      displayName: "Lab Technician (Preview)",
      organisationUnits: [{ id: ORG_UNIT_UID, name: "Central Primary Health Center" }],
    });
  });

  router.get("/programStages", (_req, res) => {
    res.json({ programStages });
  });

  router.get("/dataElementGroupSets/:uid.json", (_req, res) => {
    res.json(testGroupSet);
  });

  router.get("/dataElements/:uid.json", (req, res) => {
    if (req.params.uid === DE.orders) {
      return res.json({
        id: DE.orders,
        valueType: "MULTI_TEXT",
        optionSet: {
          id: "optSetLab01",
          options: testGroupSet.dataElementGroups.map((g) => ({
            code: g.code,
            name: g.name,
            displayName: g.displayName,
          })),
        },
      });
    }
    return res.json({ id: req.params.uid, valueType: "TEXT", optionSet: null });
  });

  router.get("/organisationUnits/:uid.json", (req, res) => {
    res.json({
      id: req.params.uid,
      name: "Central Primary Health Center",
      shortName: "Central PHC",
      displayName: "Central Primary Health Center",
      displayShortName: "Central PHC",
    });
  });

  router.get("/tracker/events", (req, res) => {
    const { programStage, trackedEntity, occurredAfter } = req.query;
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const pageSize = Math.max(1, parseInt(String(req.query.pageSize || "200"), 10) || 200);

    let results = trackerEvents.slice();
    if (programStage) {
      results = results.filter((e) => e.programStage === programStage);
    }
    if (trackedEntity) {
      results = results.filter((e) => e.trackedEntity === trackedEntity);
    }
    if (occurredAfter) {
      results = results.filter((e) => !e.occurredAt || e.occurredAt >= String(occurredAfter));
    }

    const start = (page - 1) * pageSize;
    res.json({ events: results.slice(start, start + pageSize) });
  });

  router.get("/tracker/trackedEntities", (req, res) => {
    const filterParam = req.query.filter ? String(req.query.filter) : "";
    let results = trackedEntities.slice();
    if (filterParam) {
      const parts = filterParam.split(":");
      const attrUid = parts[0];
      const needle = (parts.slice(2).join(":") || "").toLowerCase();
      results = results.filter((tei) =>
        (tei.attributes || []).some(
          (a) => a.attribute === attrUid && String(a.value || "").toLowerCase().includes(needle)
        )
      );
    }
    res.json({ trackedEntities: results });
  });

  router.get("/tracker/trackedEntities/:id", (req, res) => {
    const tei = trackedEntities.find((t) => t.trackedEntity === req.params.id);
    if (!tei) return res.status(404).json({ message: "Tracked entity not found" });
    return res.json(tei);
  });

  router.post("/tracker", (req, res) => {
    const strategy = String(req.query.importStrategy || "CREATE_AND_UPDATE").toUpperCase();
    const incoming = Array.isArray(req.body?.events) ? req.body.events : [];

    for (const evt of incoming) {
      if (strategy === "DELETE") {
        trackerEvents = trackerEvents.filter((e) => e.event !== evt.event);
      } else if (strategy === "CREATE") {
        const created = { ...evt, event: evt.event || generateUid() };
        trackerEvents.unshift(created);
      } else if (strategy === "UPDATE") {
        const idx = trackerEvents.findIndex((e) => e.event === evt.event);
        if (idx >= 0) trackerEvents[idx] = { ...trackerEvents[idx], ...evt };
        else trackerEvents.unshift(evt);
      } else {
        const idx = trackerEvents.findIndex((e) => e.event === evt.event);
        if (idx >= 0) trackerEvents[idx] = { ...trackerEvents[idx], ...evt };
        else trackerEvents.unshift({ ...evt, event: evt.event || generateUid() });
      }
    }

    res.json({ status: "OK", stats: { imported: incoming.length } });
  });

  return router;
}

const dhis2Router = createDhis2Router();
app.use("/ephc/api", dhis2Router);
app.use("/api", dhis2Router);

app.get("/laboratory-app.zip", (_req, res) => {
  res.download(path.join(__dirname, "build", "laboratory-app.zip"), "laboratory-app.zip");
});

app.use(express.static(path.join(__dirname, "src")));
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

app.listen(PORT, HOST, () => {
  console.log(`Laboratory DHIS2 preview server running at http://${HOST}:${PORT}`);
});
