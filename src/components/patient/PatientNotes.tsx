
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PencilLine, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const PatientNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem("patientNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    localStorage.setItem("patientNotes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleAddNote = () => {
    setCurrentNote(null);
    setTitle("");
    setContent("");
    setIsDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsDialogOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotesToStorage(updatedNotes);
    toast.success("Note supprimée avec succès");
  };

  const handleSaveNote = () => {
    if (!title.trim()) {
      toast.error("Veuillez ajouter un titre à votre note");
      return;
    }

    if (!content.trim()) {
      toast.error("Veuillez ajouter un contenu à votre note");
      return;
    }

    let updatedNotes: Note[];

    if (currentNote) {
      // Edit existing note
      updatedNotes = notes.map(note => 
        note.id === currentNote.id 
          ? { ...note, title, content }
          : note
      );
      toast.success("Note mise à jour avec succès");
    } else {
      // Add new note
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
      };
      updatedNotes = [...notes, newNote];
      toast.success("Note ajoutée avec succès");
    }

    saveNotesToStorage(updatedNotes);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Mes Notes</h3>
        <Button onClick={handleAddNote} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Note
        </Button>
      </div>

      <p className="text-gray-500">
        Suivez vos symptômes, notez vos inquiétudes ou préparez des questions pour votre prochain rendez-vous.
      </p>

      {notes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de notes.</p>
            <Button variant="outline" onClick={handleAddNote}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter ma première note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentNote ? "Modifier la note" : "Ajouter une note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium mb-1 block">
                Titre
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Symptômes de migraine"
              />
            </div>
            <div>
              <label htmlFor="content" className="text-sm font-medium mb-1 block">
                Contenu
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Décrivez vos symptômes, inquiétudes ou questions..."
                rows={8}
              />
            </div>
            <Button className="w-full" onClick={handleSaveNote}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
