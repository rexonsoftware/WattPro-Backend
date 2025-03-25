class InstallationDTO {
    constructor(parse) {
      this.id = parse.id;
      this.objekt_nr = parse.project_nr;
      this.kundenname = parse.kunde;
      this.bemerkungen = parse.bemerkungen;
      this.directory_path = parse.path;
      // this.strabe = parse.strabe;
      // this.plz = parse.plz;
      // this.ort = parse.ort;
      // this.tel = parse.tel;
      // this.fax = parse.fax;
      // this.email = parse.email;
      // this.jhare = parse.jhare;
      // this.createdAt = parse.createdAt;
    }
}

class InstallationDetailDTO {
  constructor(parse) {
    this.id = parse.id;
    this.objekt_nr = parse.project_nr;
    this.kundenname = parse.kunde;
    this.bemerkungen = parse.bemerkungen;
    this.directory_path = parse.path;
    this.contactperson = parse.contactperson;
    this.address = parse.address;
    this.strabe = parse.strabe;
    this.plz = parse.plz;
    this.ort = parse.ort;
    this.tel = parse.tel;
    this.fax = parse.fax;
    this.email = parse.email;
    this.jhare = parse.jhare;
    this.createdAt = parse.createdAt;
  }
}

module.exports = {InstallationDTO, InstallationDetailDTO};
