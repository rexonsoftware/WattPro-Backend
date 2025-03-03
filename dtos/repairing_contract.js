class RepairingContractDTO {
    constructor(params) {
       this.repairing_id = params.id;
       this.id = params.contract_id;
       this.bezeichnung = params.bezeichnung;
       this.datum = params.datum;
       this.bemerkung = params.bemerkung;
       this.auftraggeber_name = params.auftraggeber_name;
       this.status = null;
       this.fortschritt = params.progress; 
    }
}

class RepairingTaskDTO {
    constructor(params) {
       this.repairing_task_id = params.id;
       this.aufgabeposition = params.aufgabeposition;
       this.bezeichnung = params.bezeichnung;
       this.user_fullname = params.fullname;
       this.user_email = params.email;
       this.status = params.status;
       this.createdAt = params.createdAt;
    }
}

class RepairingTaskViewDTO {
    constructor(params) {
       this.repairing_task_id = params.id;
       this.aufgabeposition = params.aufgabeposition;
       this.bezeichnung = params.bezeichnung;
       this.datum = params.datum;
       this.material = params.material;
       this.sachkundiger_id = params.user_id;
       this.clock_start = params.clock_start;
       this.clock_end = params.clock_end;
       this.baugruppe_inst_id = params.baugruppe_inst_id;
       this.bauelement_id = params.bauelement_id;
       this.bemerkung = params.bemerkung;
       this.tatigkeit_als = params.tatigkeit_als;
       this.status = params.status;
       this.createdAt = params.createdAt;
    }
}
module.exports = { RepairingContractDTO, RepairingTaskDTO, RepairingTaskViewDTO};
