
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Heart, AlertTriangle, Pill, Paperclip } from "lucide-react";

const medicalInfoSchema = z.object({
  consultationReason: z.string().min(5, {
    message: "Le motif de consultation doit contenir au moins 5 caractères",
  }),
  currentSymptoms: z.string().optional(),
  knownAllergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalDocuments: z.any().optional(),
});

export type MedicalInfoFormValues = z.infer<typeof medicalInfoSchema>;

interface MedicalInformationFormProps {
  onSave: (data: MedicalInfoFormValues) => void;
  initialData?: Partial<MedicalInfoFormValues>;
}

export const MedicalInformationForm = ({
  onSave,
  initialData = {},
}: MedicalInformationFormProps) => {
  const form = useForm<MedicalInfoFormValues>({
    resolver: zodResolver(medicalInfoSchema),
    defaultValues: {
      consultationReason: initialData.consultationReason || "",
      currentSymptoms: initialData.currentSymptoms || "",
      knownAllergies: initialData.knownAllergies || "",
      currentMedications: initialData.currentMedications || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="consultationReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Motif de consultation
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Décrivez la raison de votre consultation" {...field} />
                </FormControl>
                <FormDescription>
                  Veuillez décrire la raison principale de votre rendez-vous
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentSymptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Symptômes actuels
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Décrivez vos symptômes actuels (facultatif)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="knownAllergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Allergies connues
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Listez vos allergies connues (facultatif)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentMedications"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Pill className="h-4 w-4 mr-2" />
                  Médicaments actuels
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Listez les médicaments que vous prenez actuellement (facultatif)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medicalDocuments"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Documents médicaux
                </FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    multiple 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    onChange={(e) => field.onChange(e.target.files)}
                    className="cursor-pointer"
                  />
                </FormControl>
                <FormDescription>
                  Vous pouvez joindre des documents pertinents pour votre rendez-vous (facultatif)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Enregistrer mes informations médicales
        </Button>
      </form>
    </Form>
  );
};
