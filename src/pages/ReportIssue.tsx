import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Building, 
  Wrench, 
  AlertTriangle, 
  Lightbulb,
  MapPin,
  FileText,
  Upload,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { campusLocations } from '@/lib/data';

const issueTypes = [
  { 
    value: 'maintenance', 
    label: 'Maintenance', 
    icon: Wrench, 
    description: 'Building issues, broken facilities, maintenance needs',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/30'
  },
  { 
    value: 'safety', 
    label: 'Safety', 
    icon: AlertTriangle, 
    description: 'Security concerns, hazards, unsafe conditions',
    color: 'bg-red-500/10 text-red-600 border-red-500/30'
  },
  { 
    value: 'cleanliness', 
    label: 'Cleanliness', 
    icon: Building, 
    description: 'Cleaning issues, sanitation, waste management',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30'
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: Lightbulb, 
    description: 'Other issues, suggestions, or feedback',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30'
  },
];

const priorities = [
  { value: 'low', label: 'Low', description: 'Minor inconvenience, can wait' },
  { value: 'medium', label: 'Medium', description: 'Should be addressed soon' },
  { value: 'high', label: 'High', description: 'Important, needs quick attention' },
  { value: 'critical', label: 'Critical', description: 'Urgent, immediate action required' },
];

const steps = [
  { id: 1, title: 'Issue Type', icon: FileText },
  { id: 2, title: 'Details', icon: FileText },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Review', icon: Check },
];

type IssueType = 'maintenance' | 'safety' | 'cleanliness' | 'noise' | 'accessibility' | 'other';
type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: '' as IssueType | '',
    title: '',
    description: '',
    priority: 'medium' as IssuePriority,
    location: '',
    isAnonymous: false,
    attachments: [] as File[],
  });

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.type;
      case 2:
        return formData.title.length >= 10 && formData.description.length >= 20;
      case 3:
        return !!formData.location;
      default:
        return true;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
  };

  const removeFile = (index: number) => {
    const newFiles = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newFiles });
  };

  const handleSubmit = async () => {
    if (!user || !formData.type) return;
    
    setIsSubmitting(true);
    
    try {
      const selectedLocation = campusLocations.find(l => l.name === formData.location);
      
      const { error } = await supabase.from('issues').insert({
        title: formData.title,
        description: formData.description,
        type: formData.type as IssueType,
        priority: formData.priority,
        status: 'pending',
        location: formData.location,
        latitude: selectedLocation?.coordinates?.lat || null,
        longitude: selectedLocation?.coordinates?.lng || null,
        reporter_id: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Issue Reported Successfully!',
        description: 'Your issue has been submitted and will be reviewed shortly.',
      });

      navigate('/my-reports');
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your issue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = issueTypes.find(t => t.value === formData.type);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Report an Issue</h1>
        <p className="mt-1 text-muted-foreground">
          Help us improve the campus by reporting problems or suggestions
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${
                  currentStep > step.id ? 'bg-primary' : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 1: Issue Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">What type of issue are you reporting?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Select the category that best describes your issue</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {issueTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as IssueType })}
                    className={`flex flex-col items-start gap-3 rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                      formData.type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${type.color}`}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Describe the Issue</h2>
                <p className="mt-1 text-sm text-muted-foreground">Provide details to help us understand and address the problem</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Explain the issue in detail. Include what happened, when, and any other relevant information."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{formData.description.length}/1000 characters</p>
                </div>

                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <div className="grid gap-2 sm:grid-cols-4">
                    {priorities.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: priority.value as IssuePriority })}
                        className={`rounded-lg border-2 p-3 text-center transition-all ${
                          formData.priority === priority.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium text-foreground">{priority.label}</p>
                        <p className="text-xs text-muted-foreground">{priority.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex cursor-pointer flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">Click to upload files</p>
                      <p className="text-xs text-muted-foreground">Images, PDFs, or documents up to 10MB</p>
                    </label>
                  </div>
                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                          <span className="text-sm text-foreground">{file.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Where is the Issue?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Select the campus location related to this issue</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Campus Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {campusLocations.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    {formData.isAnonymous ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">Submit Anonymously</p>
                      <p className="text-sm text-muted-foreground">
                        Your name will be hidden from the report
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Review Your Report</h2>
                <p className="mt-1 text-sm text-muted-foreground">Please verify all information before submitting</p>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  {selectedType && (
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedType.color}`}>
                      <selectedType.icon className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Issue Type</p>
                    <p className="font-medium text-foreground capitalize">{formData.type}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium text-foreground">{formData.title}</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground">{formData.description}</p>
                </div>

                <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant="outline" className="mt-1 capitalize">{formData.priority}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{formData.location}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Submitted By</p>
                  <p className="font-medium text-foreground">
                    {formData.isAnonymous ? 'Anonymous' : (profile?.name || 'You')}
                  </p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">Attachments</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.attachments.map((file, index) => (
                        <Badge key={index} variant="secondary">{file.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIssue;
