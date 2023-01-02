const moment = require('moment');
class ParkingStaticData{

    static get typeVechile() {
        return ['Mobil', 'Motor']
    }

    static get priceVechile(){
      return [
        {
          type: "Mobil",
          hours: 5000,
          days: 80000
        },
        {
          type: "Motor",
          hours: 2000,
          days: 40000
        }
      ]
    }

    static countPrice(request){
      let {
        typeVechile,
        startDate,
        endDate
      } = request;

      let getPriceVechile = this.priceVechile
      getPriceVechile = getPriceVechile.filter((key) => {
        return key.type == typeVechile
      })[0]

      if(!getPriceVechile){
        return [false, 0]
      }

      startDate = moment(startDate);
      endDate = moment(endDate)

      const dif = endDate.diff(startDate, "minutes")
      const difDay = Number(dif / 60 / 24).toFixed()
      let difHours = Number((dif / 60) - (difDay * 24)).toFixed()
      const difMinutes = Number(dif - (difDay * 60 * 24) - (difHours * 60)).toFixed()

      const priceDaysVechile = getPriceVechile.days
      const priceHoursVechile = getPriceVechile.hours

      if(difMinutes > 0){
        difHours = Number(difHours) + Number(1);
      }

      const getPriceDays = difDay * priceDaysVechile
      const getPriceHours = difHours * priceHoursVechile

      return [true, Number(getPriceDays) + Number(getPriceHours)]
    }

}

module.exports = ParkingStaticData
