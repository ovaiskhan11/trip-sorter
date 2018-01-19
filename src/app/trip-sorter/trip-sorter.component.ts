import {Component, OnInit} from '@angular/core';
import {RouteModel} from '../models/route.model';
import {Helper} from "../helpers/helper";
import {TripService} from '../services/trip.service';
declare let $: any;
@Component({
  selector: 'app-trip-sorter',
  templateUrl: './trip-sorter.component.html',
  styleUrls: ['./trip-sorter.css']
})
export class TripSorterComponent implements OnInit {

  viewTripResult: boolean = false;
  routes: Map<string, Array<RouteModel>>;
  tripData: Array<RouteModel>;
  cities: Array<string>;
  departureCitySelected: string = '';
  arrivalCitySelected: string = '';
  tripType: string = 'price';
  totalTripTime: string = '';
  totalTripPrice: number = 0;
  sortTypeSelected: string = 'cheapest';
  currency: string = 'EUR';
  isError: boolean = false;
  errorMessage: string = '';

  constructor(private tripService: TripService, private helper: Helper) {
    this.routes = new Map();
  }

  ngOnInit() {
    this.tripService.getTripDataFromJsonFile().subscribe((response: any) => {
      this.currency = response.currency;
      if (response.deals) {
        this.setCitiesData(response.deals);
        this.makeRouteMap(response.deals);
      }
    });
  }

  /**
   * The following method is used to set cities data
   * @param citiesData
   */
  setCitiesData(citiesData: any) : void {
    let cityHashMap = {};
    let cities = [];
    for (let i in citiesData) {
      let city = citiesData[i];
      if (!cityHashMap[city.departure]) {
        cityHashMap[city.departure] = 1;
        cities.push(city.departure);
      }

      if (!cityHashMap[city.arrival]) {
        cityHashMap[city.arrival] = 1;
        cities.push(city.arrival);
      }
    }

    this.cities = cities.sort();
  }

  /**
   * The following method is used to make a route or graph to find path
   * @param data
   */
  makeRouteMap(data: any) : void{
    data.forEach(deal => {
      let { departure, arrival, duration, transport, cost, discount } = deal;
      if (!this.routes.has(departure)) {
        this.routes.set(departure, []);
      }
      let destinations = this.routes.get(departure);
      destinations.push({
        departure,
        arrival,
        transport,
        minutes: this.helper.convertMinutesIntoDuration(duration.h, duration.m),
        time: `${duration.h}:${duration.m}`,
        price: this.helper.getPrice(cost, discount)
      });
      this.routes.set(departure, destinations);
    });
  }

  /**
   * The following method is used to set the trip filter selected from front end
   * @param event
   * @param tripTypeValue
   */
  tripSortType(event: any, tripTypeValue: string) {
    this.tripType = tripTypeValue;
    if(event.target.id === "cheapest_button") {
      $("#cheapest_button").addClass("active");
      $("#fastest_button").removeClass("active");
      this.sortTypeSelected = 'cheapest';
    } else if(event.target.id === "fastest_button") {
      $("#fastest_button").addClass("active");
      $("#cheapest_button").removeClass("active");
      this.sortTypeSelected = 'fastest';
    }
  }

  /**
   * The following method is used to find the cheapest or fastest path and also make an array of trip
   */
  searchTrip() {
    // if departure and arrival fields are empty, then display error
    if(this.departureCitySelected === '' || this.arrivalCitySelected === '') {
      this.isError = true;
      this.errorMessage = 'Please enter departure and arrival city';
    }
    // if departure and arrival city name are same, the display error
    else if (this.departureCitySelected === this.arrivalCitySelected) {
      this.isError = true;
      this.errorMessage = 'Departure and arrival city cannot be the same';
    }
    // if departure or arrival city name is not exist in the city list, the display error
    else if (this.cities.indexOf(this.departureCitySelected) === -1 || this.cities.indexOf(this.arrivalCitySelected) === -1) {
      this.isError = true;
      this.errorMessage = 'Departure and arrival city does not exist. Pease select city name in the given suggestion list';
    }
    else {
      this.isError = false;
      this.errorMessage = '';

      let departureCity = this.departureCitySelected;
      let arrivalCity = this.arrivalCitySelected;

      let direction = this.findCheapestFastestPath(departureCity, arrivalCity);
      this.tripData = [];

      let origin = arrivalCity;
      while (origin !== departureCity) {
        this.tripData.unshift(direction[origin]);
        origin = direction[origin].departure;
      }
      this.viewTripResult = true;
      this.getTotalTripPrice(this.tripData);
      this.getTotalTripTime(this.tripData);
    }
  }

  /**
   * The following method is used to get the total trip price
   * @param tripData
   */
  getTotalTripPrice(tripData: any) {
    if (Object.entries(tripData).length > 0) {
      for (let [key, value] of Object.entries(tripData)) {
        this.totalTripPrice += value.price;
      }
    }
  }

  /**
   * The following method is used to get the total trip time
   * @param tripData
   */
  getTotalTripTime(tripData: any) {
    if (Object.entries(tripData).length > 0) {
      let totalMinutes = 0;
      for (let [key, value] of Object.entries(tripData)) {
        totalMinutes += value.minutes;
      }
      this.totalTripTime = this.helper.convertMinsToHrsMins(totalMinutes);
    }
  }

  /**
   * The following method is used to find cheapest or fastest path using Dijkstra's algorithm
   * @param departureCity
   * @param arrivalCity
   */
  findCheapestFastestPath(departureCity: any, arrivalCity: any) {
    let enqueue = [];
    let cost = {};
    let direction = {};
    this.cities.forEach(city => {
      cost[city] = -1;
      enqueue.push(city);
    });
    cost[departureCity] = 0;

    while (enqueue.length) {
      // find the lowest cost city in the enqueue array
      let lowestCostCity = this.helper.getLowestPrice(enqueue, cost);
      if (lowestCostCity === arrivalCity) {
        break;
      }
      // removed lower cost city from enqueue array
      this.helper.removeItemInArray(enqueue, lowestCostCity);

      // update cost and direction object
      this.routes.get(lowestCostCity).forEach(route => {
        let newCost = cost[lowestCostCity] + route[this.tripType];
        if (cost[route.arrival] === -1 || newCost < cost[route.arrival]) {
          cost[route.arrival] = newCost;
          direction[route.arrival] = route;
        }
      });
    }
    return direction;
  }

  /**
   * The following method is used to reset the form
   */
  resetTrip() {
    this.viewTripResult = false;
    this.departureCitySelected = '';
    this.arrivalCitySelected = '';
  }
}
