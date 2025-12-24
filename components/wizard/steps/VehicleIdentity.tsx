"use client";

import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WizardLayout } from "../WizardLayout";
import { Car, Fuel, Gauge, Calendar } from "lucide-react";

export function VehicleIdentity() {
  const { vehicleData, setVehicleData, setStep } = useWizardStore();

  const isComplete =
    vehicleData.brand &&
    vehicleData.model &&
    vehicleData.year &&
    vehicleData.odometer > 0;

  return (
    <WizardLayout
      title="Identitas Kendaraan"
      description="Lengkapi data kendaraan Anda untuk analisa yang akurat."
      progress={20}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Brand & Model */}
          <div className="space-y-2">
            <Label>Merek</Label>
            <Input
              placeholder="Contoh: Honda"
              value={vehicleData.brand}
              onChange={(e) => setVehicleData({ brand: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Model / Type</Label>
            <Input
              placeholder="Contoh: Brio Satya"
              value={vehicleData.model}
              onChange={(e) => setVehicleData({ model: e.target.value })}
            />
          </div>

          {/* Year & Odometer */}
          <div className="space-y-2">
            <Label>Tahun</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                type="number"
                placeholder="2018"
                value={vehicleData.year}
                onChange={(e) => setVehicleData({ year: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kilometer (Odometer)</Label>
            <div className="relative">
              <Gauge className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                type="number"
                placeholder="50000"
                value={vehicleData.odometer || ""}
                onChange={(e) =>
                  setVehicleData({ odometer: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </div>

        {/* Transmission & Fuel (Radio Groups for quick select) */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Transmisi</Label>
            <RadioGroup
              value={vehicleData.transmission}
              onValueChange={(val: any) =>
                setVehicleData({ transmission: val })
              }
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="manual"
                  id="manual"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="manual"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-xl font-bold">MT</span>
                  <span className="text-muted-foreground text-xs mt-1">
                    Manual
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="automatic"
                  id="automatic"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="automatic"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-xl font-bold">AT</span>
                  <span className="text-muted-foreground text-xs mt-1">
                    Matic
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="cvt" id="cvt" className="peer sr-only" />
                <Label
                  htmlFor="cvt"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-xl font-bold">CVT</span>
                  <span className="text-muted-foreground text-xs mt-1">
                    CVT
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Bahan Bakar</Label>
            <Select
              value={vehicleData.fuel}
              onValueChange={(val: any) => setVehicleData({ fuel: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bahan Bakar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">
                  Bensin (Pertamax/Pertalite)
                </SelectItem>
                <SelectItem value="diesel">Diesel (Solar/Dex)</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="electric">Electric (EV)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => setStep(2)}
            disabled={!isComplete}
            size="lg"
            className="w-full md:w-auto"
          >
            Lanjut Pilih Kategori
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
