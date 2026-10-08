export const PURPLE_CONFIG = {
  branding: {
    facilityTitle: 'MANU PROTOCOL',
    zoneName: 'PURPLE ZONE',
    subTitle: 'TRANSIT // EXTRACTION FACILITY',
    sanctuaryLinkStatus: 'SANCTUARY LINK: ACTIVE',
    systemStatus: 'ONLINE',
    sectorCode: 'SECTOR-09-PZ',
  },
  narrative: {
    arrivalTagline: 'The Sanctuary has been left behind. The final system evaluation determines whether extraction can be authorized.',
    evaluationRequiredNotice: 'Final evaluation required before extraction authorization.',
    clearanceNotice: 'Extraction transporter dispatch authorized upon survival policy convergence.',
    extractionCompleteHeader: 'EXTRACTION COMPLETE',
    sanctuaryClearLabel: 'SANCTUARY CLEAR',
    transmissionEndedLabel: 'TRANSMISSION ENDED',
  },
  routeStages: [
    {
      id: 'sanctuary',
      label: 'SANCTUARY',
      description: 'Containment perimeter cleared',
    },
    {
      id: 'transit',
      label: 'TRANSIT',
      description: 'Transit corridor traversed',
    },
    {
      id: 'ml_eval',
      label: 'ML EVALUATION',
      description: 'Survival policy assessment',
    },
    {
      id: 'exit_gate',
      label: 'EXIT GATE',
      description: 'Blast barrier 04 clearance',
    },
    {
      id: 'helipad',
      label: 'HELIPAD',
      description: 'Tactical pad 01 activation',
    },
    {
      id: 'extraction',
      label: 'EXTRACTION',
      description: 'Airborne facility departure',
    },
  ],
  systemSpecs: {
    datasetBatch: 'DATASET-VECTOR-094E',
    datasetSize: '12,400 Sanctuary sensor profiles',
    modelCheck: 'Survival Policy v7.2 (Frozen weights)',
    gateId: 'BLAST GATE 04-PZ',
    padId: 'TACTICAL HELIPAD 01',
    aircraftCallsign: 'EXTRACTION PROTOCOL 09',
  },
};
