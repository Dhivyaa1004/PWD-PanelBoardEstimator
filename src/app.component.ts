import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class AppComponent {
  // --- Constants ---
  readonly FT_TO_METERS = 0.3048;

  // --- State Signals for Dimensions ---
  lengthFt = signal<number | null>(null);
  heightFt = signal<number | null>(null);
  depthFt = signal<number | null>(null);
  verticalSeparators = signal<number | null>(null);
  horizontalSeparators = signal<number | null>(null);

  // --- State Signals for Cost Inputs ---
  crcaSheetCostPerSqFt = signal<number | null>(null);
  fabricationCostPerSqFt = signal<number | null>(null);
  wastagePercent = signal<number | null>(10);

  // -- Base Channel --
  channelLengthFt = signal<number | null>(null);
  channelBreadthFt = signal<number | null>(null);
  channelHeightFt = signal<number | null>(null);
  msChannelCostPerSqFt = signal<number | null>(null);
  channelFabricationCostPerSqFt = signal<number | null>(null);

  // -- Copper Bus Bar --
  copperLengthFt = signal<number | null>(null);
  numberOfCoppers = signal<number | null>(null);
  copperWeightPerMeter = signal<number | null>(null);
  copperPricePerKg = signal<number | null>(null);

  // -- Earth Bus Bar --
  earthBarLengthFt = signal<number | null>(null);
  numberOfEarthBars = signal<number | null>(null);
  earthBarWeightPerMeter = signal<number | null>(null);
  earthBarPricePerKg = signal<number | null>(null);

  // -- Switches Connection 1 --
  numberOfSwitches1 = signal<number | null>(null);
  copperLengthPerSwitchFt1 = signal<number | null>(null);
  connectionCopperWeightPerMeter1 = signal<number | null>(null);
  connectionCopperPricePerKg1 = signal<number | null>(null);
  
  // -- Switches Connection 2 --
  numberOfSwitches2 = signal<number | null>(null);
  copperLengthPerSwitchFt2 = signal<number | null>(null);
  connectionCopperWeightPerMeter2 = signal<number | null>(null);
  connectionCopperPricePerKg2 = signal<number | null>(null);

  // -- Tinning --
  tinningCopperPricePerKg = signal<number | null>(null);

  // -- Hylem Sheet & Other Components --
  hylemSheetAreaSqM = signal<number | null>(null);
  hylemSheetPricePerSqM = signal<number | null>(null);
  numberOfSmc = signal<number | null>(null);
  smcPricePerUnit = signal<number | null>(null);
  numberOfInterconnectionSwitches = signal<number | null>(null);
  interconnectionPricePerSwitch = signal<number | null>(null);

  // -- Painting & Miscellaneous --
  powderCoatedSqM = signal<number | null>(null);
  powderCoatedPrice = signal<number | null>(null);
  scribingUnits = signal<number | null>(1);
  scribingPrice = signal<number | null>(null);
  numberOfDangerBoards = signal<number | null>(null);
  dangerBoardPrice = signal<number | null>(null);
  numberOfMeters = signal<number | null>(null);
  meterPrice = signal<number | null>(null);
  transportUnits = signal<number | null>(1);
  transportPrice = signal<number | null>(null);

  // -- Main Switches & ETC --
  switchTypeIA = signal<string>('');
  numberOfSwitches400A = signal<number | null>(null);
  switchPrice400A = signal<number | null>(null);
  switchTypeOA1 = signal<string>('');
  numberOfSwitches315A = signal<number | null>(null);
  switchPrice315A = signal<number | null>(null);
  switchTypeOA2 = signal<string>('');
  numberOfSwitches250A = signal<number | null>(null);
  switchPrice250A = signal<number | null>(null);
  etcUnits = signal<number | null>(1);
  etcPrice = signal<number | null>(null);

  // -- Adjustments --
  sundriesPercent = signal<number | null>(1);


  // --- Computed Signals for Calculation ---
  baseSheetMetalArea = computed(() => {
    const L = this.lengthFt() ?? 0;
    const H = this.heightFt() ?? 0;
    const D = this.depthFt() ?? 0;
    const vSepCount = this.verticalSeparators() ?? 0;
    const hSepCount = this.horizontalSeparators() ?? 0;

    if (L <= 0 || H <= 0 || D <= 0) {
      return 0;
    }

    const mainBoxArea = 2 * (L * H + L * D + H * D);
    const vSepArea = vSepCount * H * D;
    const hSepArea = hSepCount * L * D;

    return mainBoxArea + vSepArea + hSepArea;
  });

  totalSheetMetalAreaWithWastage = computed(() => {
    const baseArea = this.baseSheetMetalArea();
    const wastage = this.wastagePercent() ?? 0;
    return baseArea * (1 + wastage / 100);
  });

  enclosureCost = computed(() => {
    const totalArea = this.totalSheetMetalAreaWithWastage();
    const materialCost = this.crcaSheetCostPerSqFt() ?? 0;
    const fabricationCost = this.fabricationCostPerSqFt() ?? 0;
    return totalArea * (materialCost + fabricationCost);
  });

  baseChannelArea = computed(() => {
    const L = this.channelLengthFt() ?? 0;
    const B = this.channelBreadthFt() ?? 0;
    const H = this.channelHeightFt() ?? 0;

    if (L <= 0 || B <= 0 || H <= 0) {
      return 0;
    }
    const perimeter = 2 * (L + B);
    return perimeter * H;
  });

  baseChannelCost = computed(() => {
    const area = this.baseChannelArea();
    const materialCost = this.msChannelCostPerSqFt() ?? 0;
    const fabricationCost = this.channelFabricationCostPerSqFt() ?? 0;
    return area * (materialCost + fabricationCost);
  });

  totalCopperLengthMeters = computed(() => {
    const lengthFt = this.copperLengthFt() ?? 0;
    const count = this.numberOfCoppers() ?? 0;
    return (lengthFt * this.FT_TO_METERS) * count;
  });

  totalCopperWeightKg = computed(() => {
    const totalLength = this.totalCopperLengthMeters();
    const weightPerMeter = this.copperWeightPerMeter() ?? 0;
    return totalLength * weightPerMeter;
  });

  copperBusBarCost = computed(() => {
    const totalWeight = this.totalCopperWeightKg();
    const pricePerKg = this.copperPricePerKg() ?? 0;
    return totalWeight * pricePerKg;
  });

  totalEarthBarLengthMeters = computed(() => {
    const lengthFt = this.earthBarLengthFt() ?? 0;
    const count = this.numberOfEarthBars() ?? 0;
    return (lengthFt * this.FT_TO_METERS) * count;
  });

  totalEarthBarWeightKg = computed(() => {
    const totalLength = this.totalEarthBarLengthMeters();
    const weightPerMeter = this.earthBarWeightPerMeter() ?? 0;
    return totalLength * weightPerMeter;
  });

  earthBusBarCost = computed(() => {
    const totalWeight = this.totalEarthBarWeightKg();
    const pricePerKg = this.earthBarPricePerKg() ?? 0;
    return totalWeight * pricePerKg;
  });

  totalConnectionCopperLengthMeters1 = computed(() => {
    const lengthPerSwitchFt = this.copperLengthPerSwitchFt1() ?? 0;
    const switchCount = this.numberOfSwitches1() ?? 0;
    return (lengthPerSwitchFt * this.FT_TO_METERS) * switchCount;
  });

  totalConnectionCopperWeightKg1 = computed(() => {
    const totalLength = this.totalConnectionCopperLengthMeters1();
    const weightPerMeter = this.connectionCopperWeightPerMeter1() ?? 0;
    return totalLength * weightPerMeter;
  });

  switchesConnectionCost1 = computed(() => {
    const totalWeight = this.totalConnectionCopperWeightKg1();
    const pricePerKg = this.connectionCopperPricePerKg1() ?? 0;
    return totalWeight * pricePerKg;
  });

  totalConnectionCopperLengthMeters2 = computed(() => {
    const lengthPerSwitchFt = this.copperLengthPerSwitchFt2() ?? 0;
    const switchCount = this.numberOfSwitches2() ?? 0;
    return (lengthPerSwitchFt * this.FT_TO_METERS) * switchCount;
  });

  totalConnectionCopperWeightKg2 = computed(() => {
    const totalLength = this.totalConnectionCopperLengthMeters2();
    const weightPerMeter = this.connectionCopperWeightPerMeter2() ?? 0;
    return totalLength * weightPerMeter;
  });

  switchesConnectionCost2 = computed(() => {
    const totalWeight = this.totalConnectionCopperWeightKg2();
    const pricePerKg = this.connectionCopperPricePerKg2() ?? 0;
    return totalWeight * pricePerKg;
  });

  totalOverallCopperWeightKg = computed(() => {
    return this.totalCopperWeightKg() +
           this.totalEarthBarWeightKg() +
           this.totalConnectionCopperWeightKg1() +
           this.totalConnectionCopperWeightKg2();
  });

  tinningCost = computed(() => {
    const totalWeight = this.totalOverallCopperWeightKg();
    const pricePerKg = this.tinningCopperPricePerKg() ?? 0;
    return totalWeight * pricePerKg;
  });

  hylemSheetCost = computed(() => {
    const area = this.hylemSheetAreaSqM() ?? 0;
    const price = this.hylemSheetPricePerSqM() ?? 0;
    return area * price;
  });

  smcCost = computed(() => {
    const count = this.numberOfSmc() ?? 0;
    const price = this.smcPricePerUnit() ?? 0;
    return count * price;
  });

  interconnectionChargesCost = computed(() => {
    const count = this.numberOfInterconnectionSwitches() ?? 0;
    const price = this.interconnectionPricePerSwitch() ?? 0;
    return count * price;
  });

  powderCoatingCost = computed(() => {
    const area = this.powderCoatedSqM() ?? 0;
    const price = this.powderCoatedPrice() ?? 0;
    return area * price;
  });

  scribingCost = computed(() => {
    const units = this.scribingUnits() ?? 0;
    const price = this.scribingPrice() ?? 0;
    return units * price;
  });

  dangerBoardCost = computed(() => {
    const count = this.numberOfDangerBoards() ?? 0;
    const price = this.dangerBoardPrice() ?? 0;
    return count * price;
  });

  multiFunctionMeterCost = computed(() => {
    const count = this.numberOfMeters() ?? 0;
    const price = this.meterPrice() ?? 0;
    return count * price;
  });

  transportCost = computed(() => {
    const units = this.transportUnits() ?? 0;
    const price = this.transportPrice() ?? 0;
    return units * price;
  });

  switches400ACost = computed(() => {
    const count = this.numberOfSwitches400A() ?? 0;
    const price = this.switchPrice400A() ?? 0;
    return count * price;
  });

  switches315ACost = computed(() => {
    const count = this.numberOfSwitches315A() ?? 0;
    const price = this.switchPrice315A() ?? 0;
    return count * price;
  });

  switches250ACost = computed(() => {
    const count = this.numberOfSwitches250A() ?? 0;
    const price = this.switchPrice250A() ?? 0;
    return count * price;
  });

  etcCost = computed(() => {
    const units = this.etcUnits() ?? 0;
    const price = this.etcPrice() ?? 0;
    return units * price;
  });


  // --- Computed Signals for Dimension Conversion ---
  channelLengthMeters = computed(() => (this.channelLengthFt() ?? 0) * this.FT_TO_METERS);
  channelBreadthMeters = computed(() => (this.channelBreadthFt() ?? 0) * this.FT_TO_METERS);
  channelHeightMeters = computed(() => (this.channelHeightFt() ?? 0) * this.FT_TO_METERS);
  copperLengthMeters = computed(() => (this.copperLengthFt() ?? 0) * this.FT_TO_METERS);
  earthBarLengthMeters = computed(() => (this.earthBarLengthFt() ?? 0) * this.FT_TO_METERS);
  copperLengthPerSwitchMeters1 = computed(() => (this.copperLengthPerSwitchFt1() ?? 0) * this.FT_TO_METERS);
  copperLengthPerSwitchMeters2 = computed(() => (this.copperLengthPerSwitchFt2() ?? 0) * this.FT_TO_METERS);

  subTotalCost = computed(() => {
    return this.enclosureCost() + 
           this.baseChannelCost() + 
           this.copperBusBarCost() + 
           this.earthBusBarCost() +
           this.switchesConnectionCost1() +
           this.switchesConnectionCost2() +
           this.tinningCost() +
           this.hylemSheetCost() +
           this.smcCost() +
           this.interconnectionChargesCost() +
           this.powderCoatingCost() +
           this.scribingCost() +
           this.dangerBoardCost() +
           this.multiFunctionMeterCost() +
           this.transportCost() +
           this.switches400ACost() +
           this.switches315ACost() +
           this.switches250ACost() +
           this.etcCost();
  });

  sundriesCost = computed(() => {
    const subTotal = this.subTotalCost();
    const percent = this.sundriesPercent() ?? 0;
    return subTotal * (percent / 100);
  });

  totalCost = computed(() => {
    return this.subTotalCost() + this.sundriesCost();
  });

  // --- Private Helper for Input Handling ---
  private handleNumericInput(
    numericSignal: (value: number | null) => void,
    event: Event
  ): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    numericSignal(isNaN(value) || value < 0 ? null : value);
  }

  private handleStringInput(
    stringSignal: (value: string) => void,
    event: Event
  ): void {
    const input = event.target as HTMLInputElement;
    stringSignal(input.value);
  }

  // --- Public Methods for Template Events ---
  onLengthChange(event: Event): void { this.handleNumericInput(this.lengthFt.set.bind(this.lengthFt), event); }
  onHeightChange(event: Event): void { this.handleNumericInput(this.heightFt.set.bind(this.heightFt), event); }
  onDepthChange(event: Event): void { this.handleNumericInput(this.depthFt.set.bind(this.depthFt), event); }
  onVerticalSeparatorsChange(event: Event): void { this.handleNumericInput(this.verticalSeparators.set.bind(this.verticalSeparators), event); }
  onHorizontalSeparatorsChange(event: Event): void { this.handleNumericInput(this.horizontalSeparators.set.bind(this.horizontalSeparators), event); }
  onCrcaSheetCostChange(event: Event): void { this.handleNumericInput(this.crcaSheetCostPerSqFt.set.bind(this.crcaSheetCostPerSqFt), event); }
  onFabricationCostChange(event: Event): void { this.handleNumericInput(this.fabricationCostPerSqFt.set.bind(this.fabricationCostPerSqFt), event); }
  onWastageChange(event: Event): void { this.handleNumericInput(this.wastagePercent.set.bind(this.wastagePercent), event); }

  onChannelLengthChange(event: Event): void { this.handleNumericInput(this.channelLengthFt.set.bind(this.channelLengthFt), event); }
  onChannelBreadthChange(event: Event): void { this.handleNumericInput(this.channelBreadthFt.set.bind(this.channelBreadthFt), event); }
  onChannelHeightChange(event: Event): void { this.handleNumericInput(this.channelHeightFt.set.bind(this.channelHeightFt), event); }
  onMsChannelCostChange(event: Event): void { this.handleNumericInput(this.msChannelCostPerSqFt.set.bind(this.msChannelCostPerSqFt), event); }
  onChannelFabricationCostChange(event: Event): void { this.handleNumericInput(this.channelFabricationCostPerSqFt.set.bind(this.channelFabricationCostPerSqFt), event); }

  onCopperLengthChange(event: Event): void { this.handleNumericInput(this.copperLengthFt.set.bind(this.copperLengthFt), event); }
  onNumberOfCoppersChange(event: Event): void { this.handleNumericInput(this.numberOfCoppers.set.bind(this.numberOfCoppers), event); }
  onCopperWeightChange(event: Event): void { this.handleNumericInput(this.copperWeightPerMeter.set.bind(this.copperWeightPerMeter), event); }
  onCopperPricePerKgChange(event: Event): void { this.handleNumericInput(this.copperPricePerKg.set.bind(this.copperPricePerKg), event); }

  onEarthBarLengthChange(event: Event): void { this.handleNumericInput(this.earthBarLengthFt.set.bind(this.earthBarLengthFt), event); }
  onNumberOfEarthBarsChange(event: Event): void { this.handleNumericInput(this.numberOfEarthBars.set.bind(this.numberOfEarthBars), event); }
  onEarthBarWeightChange(event: Event): void { this.handleNumericInput(this.earthBarWeightPerMeter.set.bind(this.earthBarWeightPerMeter), event); }
  onEarthBarPricePerKgChange(event: Event): void { this.handleNumericInput(this.earthBarPricePerKg.set.bind(this.earthBarPricePerKg), event); }

  onNumberOfSwitchesChange1(event: Event): void { this.handleNumericInput(this.numberOfSwitches1.set.bind(this.numberOfSwitches1), event); }
  onCopperLengthPerSwitchChange1(event: Event): void { this.handleNumericInput(this.copperLengthPerSwitchFt1.set.bind(this.copperLengthPerSwitchFt1), event); }
  onConnectionCopperWeightChange1(event: Event): void { this.handleNumericInput(this.connectionCopperWeightPerMeter1.set.bind(this.connectionCopperWeightPerMeter1), event); }
  onConnectionCopperPriceChange1(event: Event): void { this.handleNumericInput(this.connectionCopperPricePerKg1.set.bind(this.connectionCopperPricePerKg1), event); }

  onNumberOfSwitchesChange2(event: Event): void { this.handleNumericInput(this.numberOfSwitches2.set.bind(this.numberOfSwitches2), event); }
  onCopperLengthPerSwitchChange2(event: Event): void { this.handleNumericInput(this.copperLengthPerSwitchFt2.set.bind(this.copperLengthPerSwitchFt2), event); }
  onConnectionCopperWeightChange2(event: Event): void { this.handleNumericInput(this.connectionCopperWeightPerMeter2.set.bind(this.connectionCopperWeightPerMeter2), event); }
  onConnectionCopperPriceChange2(event: Event): void { this.handleNumericInput(this.connectionCopperPricePerKg2.set.bind(this.connectionCopperPricePerKg2), event); }

  onTinningPriceChange(event: Event): void { this.handleNumericInput(this.tinningCopperPricePerKg.set.bind(this.tinningCopperPricePerKg), event); }

  onHylemSheetAreaChange(event: Event): void { this.handleNumericInput(this.hylemSheetAreaSqM.set.bind(this.hylemSheetAreaSqM), event); }
  onHylemSheetPriceChange(event: Event): void { this.handleNumericInput(this.hylemSheetPricePerSqM.set.bind(this.hylemSheetPricePerSqM), event); }
  onNumberOfSmcChange(event: Event): void { this.handleNumericInput(this.numberOfSmc.set.bind(this.numberOfSmc), event); }
  onSmcPriceChange(event: Event): void { this.handleNumericInput(this.smcPricePerUnit.set.bind(this.smcPricePerUnit), event); }
  onNumberOfInterconnectionSwitchesChange(event: Event): void { this.handleNumericInput(this.numberOfInterconnectionSwitches.set.bind(this.numberOfInterconnectionSwitches), event); }
  onInterconnectionPriceChange(event: Event): void { this.handleNumericInput(this.interconnectionPricePerSwitch.set.bind(this.interconnectionPricePerSwitch), event); }

  onPowderCoatedSqMChange(event: Event): void { this.handleNumericInput(this.powderCoatedSqM.set.bind(this.powderCoatedSqM), event); }
  onPowderCoatedPriceChange(event: Event): void { this.handleNumericInput(this.powderCoatedPrice.set.bind(this.powderCoatedPrice), event); }
  onScribingUnitsChange(event: Event): void { this.handleNumericInput(this.scribingUnits.set.bind(this.scribingUnits), event); }
  onScribingPriceChange(event: Event): void { this.handleNumericInput(this.scribingPrice.set.bind(this.scribingPrice), event); }
  onNumberOfDangerBoardsChange(event: Event): void { this.handleNumericInput(this.numberOfDangerBoards.set.bind(this.numberOfDangerBoards), event); }
  onDangerBoardPriceChange(event: Event): void { this.handleNumericInput(this.dangerBoardPrice.set.bind(this.dangerBoardPrice), event); }
  onNumberOfMetersChange(event: Event): void { this.handleNumericInput(this.numberOfMeters.set.bind(this.numberOfMeters), event); }
  onMeterPriceChange(event: Event): void { this.handleNumericInput(this.meterPrice.set.bind(this.meterPrice), event); }
  onTransportUnitsChange(event: Event): void { this.handleNumericInput(this.transportUnits.set.bind(this.transportUnits), event); }
  onTransportPriceChange(event: Event): void { this.handleNumericInput(this.transportPrice.set.bind(this.transportPrice), event); }

  onSwitchTypeIAChange(event: Event): void { this.handleStringInput(this.switchTypeIA.set.bind(this.switchTypeIA), event); }
  onNumberOfSwitches400AChange(event: Event): void { this.handleNumericInput(this.numberOfSwitches400A.set.bind(this.numberOfSwitches400A), event); }
  onSwitchPrice400AChange(event: Event): void { this.handleNumericInput(this.switchPrice400A.set.bind(this.switchPrice400A), event); }
  
  onSwitchTypeOA1Change(event: Event): void { this.handleStringInput(this.switchTypeOA1.set.bind(this.switchTypeOA1), event); }
  onNumberOfSwitches315AChange(event: Event): void { this.handleNumericInput(this.numberOfSwitches315A.set.bind(this.numberOfSwitches315A), event); }
  onSwitchPrice315AChange(event: Event): void { this.handleNumericInput(this.switchPrice315A.set.bind(this.switchPrice315A), event); }
  
  onSwitchTypeOA2Change(event: Event): void { this.handleStringInput(this.switchTypeOA2.set.bind(this.switchTypeOA2), event); }
  onNumberOfSwitches250AChange(event: Event): void { this.handleNumericInput(this.numberOfSwitches250A.set.bind(this.numberOfSwitches250A), event); }
  onSwitchPrice250AChange(event: Event): void { this.handleNumericInput(this.switchPrice250A.set.bind(this.switchPrice250A), event); }

  onEtcUnitsChange(event: Event): void { this.handleNumericInput(this.etcUnits.set.bind(this.etcUnits), event); }
  onEtcPriceChange(event: Event): void { this.handleNumericInput(this.etcPrice.set.bind(this.etcPrice), event); }
  
  onSundriesChange(event: Event): void { this.handleNumericInput(this.sundriesPercent.set.bind(this.sundriesPercent), event); }

  resetAll(): void {
    this.lengthFt.set(null);
    this.heightFt.set(null);
    this.depthFt.set(null);
    this.verticalSeparators.set(null);
    this.horizontalSeparators.set(null);
    this.crcaSheetCostPerSqFt.set(null);
    this.fabricationCostPerSqFt.set(null);
    this.wastagePercent.set(10);
    this.channelLengthFt.set(null);
    this.channelBreadthFt.set(null);
    this.channelHeightFt.set(null);
    this.msChannelCostPerSqFt.set(null);
    this.channelFabricationCostPerSqFt.set(null);
    this.copperLengthFt.set(null);
    this.numberOfCoppers.set(null);
    this.copperWeightPerMeter.set(null);
    this.copperPricePerKg.set(null);
    this.earthBarLengthFt.set(null);
    this.numberOfEarthBars.set(null);
    this.earthBarWeightPerMeter.set(null);
    this.earthBarPricePerKg.set(null);
    this.numberOfSwitches1.set(null);
    this.copperLengthPerSwitchFt1.set(null);
    this.connectionCopperWeightPerMeter1.set(null);
    this.connectionCopperPricePerKg1.set(null);
    this.numberOfSwitches2.set(null);
    this.copperLengthPerSwitchFt2.set(null);
    this.connectionCopperWeightPerMeter2.set(null);
    this.connectionCopperPricePerKg2.set(null);
    this.tinningCopperPricePerKg.set(null);
    this.hylemSheetAreaSqM.set(null);
    this.hylemSheetPricePerSqM.set(null);
    this.numberOfSmc.set(null);
    this.smcPricePerUnit.set(null);
    this.numberOfInterconnectionSwitches.set(null);
    this.interconnectionPricePerSwitch.set(null);
    this.powderCoatedSqM.set(null);
    this.powderCoatedPrice.set(null);
    this.scribingUnits.set(1);
    this.scribingPrice.set(null);
    this.numberOfDangerBoards.set(null);
    this.dangerBoardPrice.set(null);
    this.numberOfMeters.set(null);
    this.meterPrice.set(null);
    this.transportUnits.set(1);
    this.transportPrice.set(null);
    this.switchTypeIA.set('');
    this.numberOfSwitches400A.set(null);
    this.switchPrice400A.set(null);
    this.switchTypeOA1.set('');
    this.numberOfSwitches315A.set(null);
    this.switchPrice315A.set(null);
    this.switchTypeOA2.set('');
    this.numberOfSwitches250A.set(null);
    this.switchPrice250A.set(null);
    this.etcUnits.set(1);
    this.etcPrice.set(null);
    this.sundriesPercent.set(1);
  }
}