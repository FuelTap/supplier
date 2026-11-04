"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { nigerianStateNames, nigerianStates } from "@/lib/data/nigeria";
import { createStation } from "@/lib/server/admin/stations";
import { stationSchema, type StationInput } from "@/lib/validators/adminSchemas";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import FocusedCard from "@/components/admin/ui/FocusedCard";
import FocusedHeader from "@/components/admin/ui/FocusedHeader";
import ManagerPicker, { type ManagerOption } from "@/components/admin/ui/ManagerPicker";
import {
  FormField,
  PillInput,
  outlinePillClass,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";
import PillSelect from "@/components/admin/ui/PillSelect";
import SuccessCard from "@/components/admin/ui/SuccessCard";
import AddressAutocomplete from "./AddressAutocomplete";

// Leaflet touches `window` on import, so the map only loads in the browser.
const StationLocationMap = dynamic(() => import("./StationLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-62.5 animate-pulse rounded-xl bg-gray-100" aria-hidden="true" />
  ),
});

const LAGOS = { lat: 6.5244, lng: 3.3792 };

const emptyForm: StationInput = {
  name: "",
  address: "",
  state: "",
  city: "",
  latitude: null,
  longitude: null,
  managerId: null,
};

export default function AddStationForm({
  managers,
}: {
  managers: ManagerOption[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<{
    station: string;
    manager: string | null;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState(LAGOS);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<StationInput>({
    resolver: zodResolver(stationSchema),
    defaultValues: emptyForm,
    mode: "onChange",
  });

  const state = useWatch({ control, name: "state" });
  const cities = state ? (nigerianStates[state] ?? []) : [];

  async function onSubmit(values: StationInput) {
    setIsSubmitting(true);
    try {
      const result = await createStation(values);
      if (!result.success) {
        adminToast.add({ description: result.message, type: "error" });
        return;
      }
      setCreated({
        station: result.data.name,
        manager: result.data.manager?.name ?? null,
      });
    } catch {
      adminToast.add({
        description: "Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (created) {
    return (
      <SuccessCard
        title="Station Created Successfully"
        primary={{ label: "Go to Dashboard", href: "/dashboard" }}
        secondary={{
          label: "Add Another Station",
          onClick: () => {
            reset(emptyForm);
            setMapCenter(LAGOS);
            setCreated(null);
          },
        }}
      >
        <strong className="font-semibold text-black">{created.station}</strong>{" "}
        is now pending compliance review.{" "}
        {created.manager ? (
          <>
            A push notification will be sent to{" "}
            <strong className="font-semibold text-black">{created.manager}</strong>{" "}
            when active to finalize the setup.
          </>
        ) : (
          "Assign a manager to finish setting it up."
        )}
      </SuccessCard>
    );
  }

  return (
    <>
      <FocusedHeader
        progress={50}
        action="cancel"
        onAction={() => router.push("/stations")}
        showHelp
      />
      <FocusedCard
        title="Add New Fuel Station"
        description="Enter the branch location details, map coordinates, and assign a manager to oversee this fuel station profile on the platform."
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-col gap-4"
          noValidate
        >
          <FormField label="Branch Name" htmlFor="name" error={errors.name?.message}>
            <PillInput
              id="name"
              placeholder="e.g. TotalEnergies - Lekki Phase 1 Branch"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Street Address"
            htmlFor="address"
            error={errors.address?.message}
          >
            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <AddressAutocomplete
                  id="address"
                  value={field.value}
                  invalid={!!errors.address}
                  onChange={field.onChange}
                  onSelect={(result) => {
                    field.onChange(result.line1);
                    setMapCenter({ lat: result.lat, lng: result.lng });
                    setValue("latitude", result.lat);
                    setValue("longitude", result.lng);
                    if (result.state && nigerianStates[result.state]) {
                      setValue("state", result.state, { shouldValidate: true });
                      const city = nigerianStates[result.state].find(
                        (c) => c.toLowerCase() === result.city?.toLowerCase(),
                      );
                      setValue("city", city ?? "", { shouldValidate: true });
                    }
                  }}
                />
              )}
            />
          </FormField>

          <StationLocationMap
            center={mapCenter}
            onChange={(point) => {
              setValue("latitude", point.lat);
              setValue("longitude", point.lng);
            }}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="State" htmlFor="state" error={errors.state?.message}>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <PillSelect
                    id="state"
                    options={nigerianStateNames}
                    value={field.value}
                    placeholder="Choose state"
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("city", "", { shouldValidate: true });
                    }}
                  />
                )}
              />
            </FormField>
            <FormField label="City" htmlFor="city" error={errors.city?.message}>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <PillSelect
                    id="city"
                    options={cities}
                    value={field.value}
                    placeholder="Choose city"
                    disabled={!state}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          </div>

          <FormField label="Assign Manager" htmlFor="manager">
            <Controller
              control={control}
              name="managerId"
              render={({ field }) => (
                <ManagerPicker
                  id="manager"
                  managers={managers}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>

          <div className="mt-12 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className={outlinePillClass}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={primaryPillClass}
            >
              {isSubmitting ? "Creating…" : "Next"}
            </button>
          </div>
        </form>
      </FocusedCard>
    </>
  );
}
