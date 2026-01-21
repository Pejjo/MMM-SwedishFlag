Module.register("MMM-SwedishFlag", {

  defaults: {
    exampleContent: ""
  },

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["swedishflag.css"]
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    this.currentDay = 0;
    this.currentYear = 0;
    this.holidays = new Array();
    this.text = "";
    this.showFlag = false;
    this.isHoliday = false;
    // set timeout for next random text
    setInterval(() => this.dateUpdate(), 3000)
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div")

    if (this.showFlag === true) {
      image = '<img class="flagday-icon" src="modules/MMM-SwedishFlag/img/svflag.png">';	
    }
    else {
      image = '';
    }

    if (this.isHoliday === true) {
       wrapper.innerHTML = `<div class="flagday-holy"> ${image} ${this.text} </div>`;
    }
    else {
      wrapper.innerHTML = `<div class="flagday-item"> ${image} ${this.text} </div>`;
    }

    return wrapper
  },

  dateUpdate() {
    timestamp = Date.now();
    date = new Date(timestamp);
    year = date.getFullYear();
    day = date.getDate();

    if (day != this.currentDay) {
      if (this.currentYear != year) {
        this.currentYear = year;
	this.getFlagdag(year);
      }
      this.currentDay = day;

      this.text = "";
      this.showFlag = false;
      this.isHoliday = false;

      for (const hol of this.holidays) {
        if ((hol['date'].getMonth() == date.getMonth()) && (hol['date'].getDate() == day)) {
	  this.text = hol['name'];
	  this.showFlag = hol['flag'];
          this.isHoliday = hol['holiday'];
	}
      }
    }
    this.updateDom()
  },

  getEaster(Y) {
    var C = Math.floor(Y/100);
    var N = Y - 19*Math.floor(Y/19);
    var K = Math.floor((C - 17)/25);
    var I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
    I = I - 30*Math.floor((I/30));
    I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
    var J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
    J = J - 7*Math.floor(J/7);
    var L = I - J;
    var M = 3 + Math.floor((L + 40)/44);
    var D = L + 28 - 31*Math.floor(M/4);

    return new Date(Y, M-1, D);
  },

  getDayOffset(date, days) {

    var offsDate = new Date(date);
    offsDate.setUTCDate(date.getUTCDate() + days);
    return offsDate;
  },

  getFlagdag(year) {

    this.holidays = [];

    var easter = this.getEaster(year);

    // lördagen mellan 20 och 26 juni
    var midsummerStart = new Date(year, 6-1, 20);
    var midsummerSaturday  = 20  + (6 - midsummerStart.getDay());
    var midsummer = new Date(year, 6-1, (midsummerSaturday ));

    // söndag till den lördag som infaller mellan 31 oktober och 6 november
    var allhelgonStart = new Date(year,10-1,31); // Get timestamp of first day in allhelgona week
    var allhelgonSunday= 1 + (6-allhelgonStart.getDay()); // sunday is day after start saturday
    var allhelgon = new Date(year, 11-1, allhelgonSunday);
    allhelgon.setUTCDate(allhelgon.getUTCDate() - 1);  //Allhelgon is saturday so adust back possibly ending up last of oct

    // Sedan 2014 andra söndagen i september varje valår
    if ((year >= 2014) && (((year - 2014) % 4) ==0)) // Third sunday before 2014 and every third year before 1994. But too late to vote in those elections, so just skip.
    {
      var valStart = new Date(year,9 - 1,8) // Get timestamp of first day that can be second synday of month
      var valSunDay= valStart.getDay();
      if (valSunDay > 0)
      {
              valSunDay = 8 + 7 - valSunDay ;
      }
      else
      {
              valSunDay = 8;
      }
      var valdagen = new Date(year, 9-1, valSunDay);
//      self.valdagen = datetime.datetime(year, 9, valSunDay)
//      print("Valdagen ", self.valdagen)
//    else:
//      self.valdagen=None
    }
    else
    {
      valdagen = null;
   }
//  # First BOTH holiday and flagday
    this.holidays.push({'date':new Date(year, 1-1, 1), 'name':'Nyårsdagen', 'flag':true, 'holiday':true});
    this.holidays.push({'date':easter, 'name':'Påskdagen', 'flag':true, 'holiday':true});
    this.holidays.push({'date':new Date(year, 5-1, 1),'name':'1a Maj', 'flag':true, 'holiday':true});
    this.holidays.push({'date':new Date(year, 6-1, 6), 'name':'Sveriges nationaldag', 'flag':true, 'holiday':true});
    this.holidays.push({'date':midsummer,'name':'Midsommardagen', 'flag':true, 'holiday':true});
    this.holidays.push({'date':new Date(year, 12-1, 25),'name':'Juldagen', 'flag':true, 'holiday':true});
//  # Only holidays
    this.holidays.push({'date':new Date(year, 1-1, 6),'name':'Trettondag jul', 'flag':false, 'holiday':true});
    this.holidays.push({'date':this.getDayOffset(easter, -2),'name':'Långfredagen', 'flag':false, 'holiday':true});
    this.holidays.push({'date':this.getDayOffset(easter, 1),'name':'Annandag påsk', 'flag':false, 'holiday':true});
    this.holidays.push({'date':this.getDayOffset(easter, 5*7+4),'name':'Kristi himmelfärdsdag', 'flag':false, 'holiday':true});
    this.holidays.push({'date':allhelgon,'name':'Alla helgons dag', 'flag':false, 'holiday':true});
    this.holidays.push({'date':new Date(year, 12-1, 26),'name':'Annandag jul', 'flag':false, 'holiday':true});
    this.holidays.push({'date':this.getDayOffset(easter, 7*7),'name':'Pingstdagen', 'flag':true, 'holiday':true}); // No holiday anymore
//  # Enbart flaggdagar
    this.holidays.push({'date':new Date(year, 1-1, 28),'name':'Konungens namnsdag', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 3-1, 12),'name':'Kronprinsessans namnsdag', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 4-1, 30),'name':'Konungens födelsedag', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 5-1, 29),'name':'Veterandagen', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 7-1, 14),'name':'Kronprinsessans födelsedag', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 8-1, 8),'name':'Drottningens namnsdag', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 10-1, 24),'name':'FN-dagen', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 11-1, 6),'name':'Gustav Adolfsdagen', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 12-1, 10),'name':'Nobeldagen', 'flag':true, 'holiday':false});
    this.holidays.push({'date':new Date(year, 12-1, 23),'name':'Drottningens födelsedag', 'flag':true, 'holiday':false});
    if (valdagen) {
      this.holidays.push({'date':valdagen,'name':'Valdagen', 'flag':true, 'holiday':false});
    }
// EUdagen
//    console.log(this.holidays);
  }
})
