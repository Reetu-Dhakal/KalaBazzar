import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, LayoutDashboard } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import ImageField from '@/components/ui/ImageField';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { HomepageSettings } from '@/types';

const defaultSettings: HomepageSettings = {
  hero: {
    headline: '',
    subheadline: '',
    ctaText: '',
    ctaLink: '',
    backgroundImage: '',
    mobileBackgroundImage: '',
    overlayOpacity: 0.5,
    textAlignment: 'center',
  },
  featuredCategories: [],
  featuredCollections: [],
  featuredArtisans: [],
  featuredProducts: [],
  artisanSpotlight: { title: '', description: '', artisans: [] },
  storySection: { title: '', description: '', stories: [] },
  trustBadges: [],
  newsletter: { headline: '', subheadline: '', placeholder: '', buttonText: '' },
  footer: { aboutText: '', socialLinks: {}, quickLinks: [], policies: [] },
  seo: { title: '', description: '', ogImage: '' },
  updatedBy: '',
  createdAt: '',
  updatedAt: '',
};

function extractIds(items: Array<string | { _id: string }>): string[] {
  return (items || []).map((i) => (typeof i === 'string' ? i : i._id));
}

function linksToCsv(links: { label: string; url: string }[]): string {
  return (links || []).map((l) => `${l.label}|${l.url}`).join('\n');
}

function csvToLinks(csv: string): { label: string; url: string }[] {
  return csv
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split('|');
      return { label: (label || '').trim(), url: (url || '').trim() };
    });
}

export default function AdminHomepage() {
  usePageTitle('Homepage Settings — कलाbazzar', 'Configure the public homepage.');
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [catIds, setCatIds] = useState('');
  const [collIds, setCollIds] = useState('');
  const [artisanIds, setArtisanIds] = useState('');
  const [productIds, setProductIds] = useState('');
  const [spotlightIds, setSpotlightIds] = useState('');
  const [storyIds, setStoryIds] = useState('');
  const [quickLinksCsv, setQuickLinksCsv] = useState('');
  const [policiesCsv, setPoliciesCsv] = useState('');

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/homepage');
      const s = data.data || defaultSettings;
      setSettings(s);
      setCatIds(extractIds(s.featuredCategories).join(', '));
      setCollIds(extractIds(s.featuredCollections).join(', '));
      setArtisanIds(extractIds(s.featuredArtisans).join(', '));
      setProductIds(extractIds(s.featuredProducts).join(', '));
      setSpotlightIds((s.artisanSpotlight?.artisans || []).join(', '));
      setStoryIds((s.storySection?.stories || []).join(', '));
      setQuickLinksCsv(linksToCsv(s.footer?.quickLinks || []));
      setPoliciesCsv(linksToCsv(s.footer?.policies || []));
    } catch {
      toast.error('Failed to load homepage settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const toIds = (csv: string) =>
        csv.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);

      const payload = {
        hero: settings.hero,
        featuredCategories: toIds(catIds),
        featuredCollections: toIds(collIds),
        featuredArtisans: toIds(artisanIds),
        featuredProducts: toIds(productIds),
        artisanSpotlight: { ...settings.artisanSpotlight, artisans: toIds(spotlightIds) },
        storySection: { ...settings.storySection, stories: toIds(storyIds) },
        trustBadges: settings.trustBadges,
        newsletter: settings.newsletter,
        footer: {
          ...settings.footer,
          quickLinks: csvToLinks(quickLinksCsv),
          policies: csvToLinks(policiesCsv),
        },
        seo: settings.seo,
      };

      await api.put('/homepage', payload);
      toast.success('Homepage settings saved');
      fetchSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save homepage settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Homepage Settings</h1>
          <p className="text-muted-foreground mt-1">Configure the public homepage content.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Hero Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Headline"
                value={settings.hero.headline}
                onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, headline: e.target.value } })}
              />
              <Input
                label="Subheadline"
                value={settings.hero.subheadline}
                onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subheadline: e.target.value } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CTA Text"
                value={settings.hero.ctaText}
                onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaText: e.target.value } })}
              />
              <Input
                label="CTA Link"
                value={settings.hero.ctaLink}
                onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaLink: e.target.value } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ImageField
                label="Background Image"
                value={settings.hero.backgroundImage}
                onChange={(url) => setSettings({ ...settings, hero: { ...settings.hero, backgroundImage: url } })}
              />
              <div className="space-y-4">
                <ImageField
                  label="Mobile Background Image"
                  value={settings.hero.mobileBackgroundImage || ''}
                  onChange={(url) => setSettings({ ...settings, hero: { ...settings.hero, mobileBackgroundImage: url } })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Overlay Opacity"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={settings.hero.overlayOpacity}
                    onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, overlayOpacity: Number(e.target.value) } })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Text Alignment</label>
                    <select
                      value={settings.hero.textAlignment}
                      onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, textAlignment: e.target.value as 'left' | 'center' | 'right' } })}
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured selections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Featured Content (by ID)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Featured Categories"
              value={catIds}
              onChange={(e) => setCatIds(e.target.value)}
              helperText="Comma separated category IDs"
            />
            <Input
              label="Featured Collections"
              value={collIds}
              onChange={(e) => setCollIds(e.target.value)}
              helperText="Comma separated collection IDs"
            />
            <Input
              label="Featured Artisans"
              value={artisanIds}
              onChange={(e) => setArtisanIds(e.target.value)}
              helperText="Comma separated seller profile IDs"
            />
            <Input
              label="Featured Products"
              value={productIds}
              onChange={(e) => setProductIds(e.target.value)}
              helperText="Comma separated product IDs"
            />
          </CardContent>
        </Card>

        {/* Artisan spotlight + story */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Artisan Spotlight</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Title"
                  value={settings.artisanSpotlight.title}
                  onChange={(e) => setSettings({ ...settings, artisanSpotlight: { ...settings.artisanSpotlight, title: e.target.value } })}
                />
                <Input
                  label="Description"
                  value={settings.artisanSpotlight.description}
                  onChange={(e) => setSettings({ ...settings, artisanSpotlight: { ...settings.artisanSpotlight, description: e.target.value } })}
                />
              </div>
              <Input
                label="Artisan IDs"
                value={spotlightIds}
                onChange={(e) => setSpotlightIds(e.target.value)}
              />
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground">Story Section</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Title"
                  value={settings.storySection.title}
                  onChange={(e) => setSettings({ ...settings, storySection: { ...settings.storySection, title: e.target.value } })}
                />
                <Input
                  label="Description"
                  value={settings.storySection.description}
                  onChange={(e) => setSettings({ ...settings, storySection: { ...settings.storySection, description: e.target.value } })}
                />
              </div>
              <Input
                label="Story IDs"
                value={storyIds}
                onChange={(e) => setStoryIds(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trust badges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Trust Badges
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setSettings({
                  ...settings,
                  trustBadges: [...settings.trustBadges, { icon: '', title: '', description: '' }],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add Badge
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.trustBadges.length === 0 && (
              <p className="text-sm text-muted-foreground">No trust badges yet.</p>
            )}
            {settings.trustBadges.map((badge, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-3 items-center">
                <Input
                  label="Icon"
                  value={badge.icon}
                  onChange={(e) => {
                    const next = [...settings.trustBadges];
                    next[idx] = { ...badge, icon: e.target.value };
                    setSettings({ ...settings, trustBadges: next });
                  }}
                  placeholder="Shield, Truck..."
                />
                <Input
                  label="Title"
                  value={badge.title}
                  onChange={(e) => {
                    const next = [...settings.trustBadges];
                    next[idx] = { ...badge, title: e.target.value };
                    setSettings({ ...settings, trustBadges: next });
                  }}
                />
                <Input
                  label="Description"
                  value={badge.description}
                  onChange={(e) => {
                    const next = [...settings.trustBadges];
                    next[idx] = { ...badge, description: e.target.value };
                    setSettings({ ...settings, trustBadges: next });
                  }}
                />
                <div className="pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        trustBadges: settings.trustBadges.filter((_, i) => i !== idx),
                      })
                    }
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Newsletter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Newsletter Section
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Input
              label="Headline"
              value={settings.newsletter.headline}
              onChange={(e) => setSettings({ ...settings, newsletter: { ...settings.newsletter, headline: e.target.value } })}
            />
            <Input
              label="Subheadline"
              value={settings.newsletter.subheadline}
              onChange={(e) => setSettings({ ...settings, newsletter: { ...settings.newsletter, subheadline: e.target.value } })}
            />
            <Input
              label="Placeholder"
              value={settings.newsletter.placeholder}
              onChange={(e) => setSettings({ ...settings, newsletter: { ...settings.newsletter, placeholder: e.target.value } })}
            />
            <Input
              label="Button Text"
              value={settings.newsletter.buttonText}
              onChange={(e) => setSettings({ ...settings, newsletter: { ...settings.newsletter, buttonText: e.target.value } })}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Footer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="About Text"
              value={settings.footer.aboutText}
              onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, aboutText: e.target.value } })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Facebook URL"
                value={settings.footer.socialLinks.facebook || ''}
                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialLinks: { ...settings.footer.socialLinks, facebook: e.target.value } } })}
              />
              <Input
                label="Instagram URL"
                value={settings.footer.socialLinks.instagram || ''}
                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialLinks: { ...settings.footer.socialLinks, instagram: e.target.value } } })}
              />
              <Input
                label="Twitter URL"
                value={settings.footer.socialLinks.twitter || ''}
                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialLinks: { ...settings.footer.socialLinks, twitter: e.target.value } } })}
              />
              <Input
                label="YouTube URL"
                value={settings.footer.socialLinks.youtube || ''}
                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialLinks: { ...settings.footer.socialLinks, youtube: e.target.value } } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Quick Links</label>
                <textarea
                  value={quickLinksCsv}
                  onChange={(e) => setQuickLinksCsv(e.target.value)}
                  rows={4}
                  placeholder={'One per line: Label|URL\ne.g.\nShop|/shop\nAbout Us|/about'}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Policies</label>
                <textarea
                  value={policiesCsv}
                  onChange={(e) => setPoliciesCsv(e.target.value)}
                  rows={4}
                  placeholder={'One per line: Label|URL\ne.g.\nPrivacy Policy|/privacy'}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Meta Title"
                value={settings.seo.title}
                onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, title: e.target.value } })}
              />
              <Input
                label="Meta Description"
                value={settings.seo.description}
                onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, description: e.target.value } })}
              />
            </div>
            <ImageField
              label="Open Graph Image"
              value={settings.seo.ogImage || ''}
              onChange={(url) => setSettings({ ...settings, seo: { ...settings.seo, ogImage: url } })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}