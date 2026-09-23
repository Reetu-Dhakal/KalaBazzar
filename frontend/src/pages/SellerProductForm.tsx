import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import type { Category, Craft, Region, Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  shortDescription: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  story: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  customCategory: z.string().optional(),
  craft: z.string().min(1, 'Craft is required'),
  customCraft: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  basePrice: z.number().min(1, 'Price must be at least 1'),
  materials: z.array(z.string()).optional(),
  isHandmade: z.boolean().default(true),
  isCustomizable: z.boolean().default(false),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, 'Variant name required'),
        sku: z.string().optional(),
        price: z.number().min(0),
        compareAtPrice: z.number().optional(),
        inventory: z.number().min(0),
        attributes: z.record(z.string()).default({}),
      }),
    )
    .optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function SellerProductForm() {
  usePageTitle();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const blobUrlToFileRef = useRef<Map<string, File>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const [materialInput, setMaterialInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      story: '',
      category: '',
      customCategory: '',
      craft: '',
      customCraft: '',
      region: '',
      basePrice: 0,
      materials: [],
      isHandmade: true,
      isCustomizable: false,
      variants: [],
    },
  });

  const {
    fields: variantFields,
    append: addVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'variants' });

  const materials = watch('materials') || [];
  const selectedCategory = watch('category');
  const selectedCraft = watch('craft');

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, craftRes, regionRes] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/crafts'),
          api.get('/regions'),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data || []);
        if (craftRes.status === 'fulfilled') setCrafts(craftRes.value.data.data || []);
        if (regionRes.status === 'fulfilled') setRegions(regionRes.value.data.data || []);
      } catch {
        // handled
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    if (!isEditing || !id) return;
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/id/${id}`);
        const product: Product = data.data.product;
        reset({
          name: product.name,
          shortDescription: product.shortDescription || '',
          description: product.description,
          story: product.story || '',
          category: typeof product.category === 'object' ? product.category._id : product.category,
          craft: typeof product.craft === 'object' ? product.craft._id : product.craft,
          region: typeof product.region === 'object' ? product.region._id : product.region,
          basePrice: product.basePrice,
          materials: product.materials || [],
          isHandmade: product.isHandmade,
          isCustomizable: product.isCustomizable,
          variants: product.variants?.map((v) => ({
            name: v.name,
            sku: v.sku || '',
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            inventory: v.inventory,
            attributes: v.attributes || {},
          })) || [],
        });
        const allImages = product.variants?.flatMap((v) => v.images) || [];
        setImages(allImages);
      } catch {
        toast.error('Failed to load product');
        navigate('/seller/products');
      } finally {
        setIsLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [isEditing, id, navigate, reset]);

  const addMaterial = () => {
    if (materialInput.trim()) {
      const current = materials || [];
      if (!current.includes(materialInput.trim())) {
        setValue('materials', [...current, materialInput.trim()], { shouldValidate: true });
      }
      setMaterialInput('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    const newImages = files.map((file) => {
      const url = URL.createObjectURL(file);
      blobUrlToFileRef.current.set(url, file);
      return url;
    });
    setImages((prev) => [...prev, ...newImages]);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    const removedImage = images[index];
    if (removedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(removedImage);
      blobUrlToFileRef.current.delete(removedImage);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles(Array.from(blobUrlToFileRef.current.values()));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return images;
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append('images', file));
    const { data } = await api.post('/upload/product-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const uploadedUrls = data.data.urls || data.data.images || [];
    const existingImages = images.filter((img) => !img.startsWith('blob:'));
    return [...existingImages, ...uploadedUrls];
  };

  const saveProduct = async (asDraft: boolean) => {
    const formData = watch();
    const isOtherCategory = formData.category === '__other__';
    const isOtherCraft = formData.craft === '__other__';
    if (isOtherCategory && !formData.customCategory?.trim()) {
      toast.error('Please enter a name for your custom category');
      setIsSaving(false);
      return;
    }
    if (isOtherCraft && !formData.customCraft?.trim()) {
      toast.error('Please enter a name for your custom craft');
      setIsSaving(false);
      return;
    }
    setIsSaving(true);
    try {
      const uploadedImages = await uploadImages();
      const payload = {
        ...formData,
        category: isOtherCategory ? undefined : formData.category,
        customCategory: isOtherCategory && formData.customCategory?.trim()
          ? formData.customCategory.trim()
          : undefined,
        craft: isOtherCraft ? undefined : formData.craft,
        customCraft: isOtherCraft && formData.customCraft?.trim()
          ? formData.customCraft.trim()
          : undefined,
        images: uploadedImages,
        status: asDraft ? 'draft' : 'approved',
      };
      if (isEditing && id) {
        await api.put(`/products/${id}`, payload);
        toast.success(asDraft ? 'Product saved as draft' : 'Product updated');
      } else {
        await api.post('/products', payload);
        toast.success(asDraft ? 'Product saved as draft' : 'Product created');
      }
      navigate('/seller/products');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: { msg: string; path?: string }[] } } };
      const serverMessage = axiosError.response?.data?.message;
      const validationErrors = axiosError.response?.data?.errors;
      if (validationErrors?.length) {
        const details = validationErrors.map((e) => e.msg).join(', ');
        toast.error(details);
      } else {
        toast.error(serverMessage || 'Failed to save product');
      }
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await saveProduct(false);
  };

  if (isLoadingData || isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/seller/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-heading text-foreground">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update your product details' : 'Create a new product listing'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Product Name"
                placeholder="e.g. Hand-Painted Mandala Plate"
                error={errors.name?.message}
                {...register('name')}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Short Description
                </label>
                <Input
                  placeholder="Brief description for product cards"
                  {...register('shortDescription')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Full Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="flex min-h-[37.5px] w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  placeholder="Describe your product in detail..."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Story Behind the Product
                </label>
                <textarea
                  className="flex min-h-25 w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  placeholder="Tell the story behind this product..."
                  {...register('story')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Price (NPR)"
                type="number"
                min={0}
                error={errors.basePrice?.message}
                {...register('basePrice', { valueAsNumber: true })}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">Up to 5 images. Recommended: 800x800px</p>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variants</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addVariant({
                    name: '',
                    sku: '',
                    price: 0,
                    inventory: 0,
                    attributes: {},
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>
            </CardHeader>
            <CardContent>
              {variantFields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No variants. Add variants for different sizes, colors, etc.
                </p>
              ) : (
                <div className="space-y-4">
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="p-4 rounded-lg border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Variant {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Name"
                          placeholder="e.g. Small / Red"
                          error={errors.variants?.[index]?.name?.message}
                          {...register(`variants.${index}.name`)}
                        />
                        <Input
                          label="SKU"
                          placeholder="e.g. SKU-001"
                          {...register(`variants.${index}.sku`)}
                        />
                        <Input
                          label="Price"
                          type="number"
                          min={0}
                          {...register(`variants.${index}.price`, { valueAsNumber: true })}
                        />
                        <Input
                          label="Inventory"
                          type="number"
                          min={0}
                          {...register(`variants.${index}.inventory`, { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category, Craft, Region */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('category')}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__other__">Other (add your own)...</option>
                </select>
                {errors.category && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.category.message}</p>
                )}
                {selectedCategory === '__other__' && (
                  <div className="mt-3">
                    <Input
                      label="New Category Name"
                      placeholder="e.g. Bamboo Weaving"
                      {...register('customCategory')}
                    />
                    {errors.customCategory && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.customCategory.message}</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Craft <span className="text-destructive">*</span>
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('craft')}
                >
                  <option value="">Select craft</option>
                  {crafts.map((craft) => (
                    <option key={craft._id} value={craft._id}>
                      {craft.name}
                    </option>
                  ))}
                  <option value="__other__">Other (add your own)...</option>
                </select>
                {errors.craft && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.craft.message}</p>
                )}
                {selectedCraft === '__other__' && (
                  <div className="mt-3">
                    <Input
                      label="New Craft Name"
                      placeholder="e.g. Bamboo Weaving"
                      {...register('customCraft')}
                    />
                    {errors.customCraft && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.customCraft.message}</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Region <span className="text-destructive">*</span>
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('region')}
                >
                  <option value="">Select region</option>
                  {regions.map((region) => (
                    <option key={region._id} value={region._id}>
                      {region.name}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.region.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Materials</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add material"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMaterial();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addMaterial}>
                    Add
                  </Button>
                </div>
                {materials.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {materials.map((mat) => (
                      <Badge key={mat} variant="secondary" className="gap-1">
                        {mat}
                        <button
                          type="button"
                          onClick={() =>
                            setValue(
                              'materials',
                              materials.filter((m) => m !== mat),
                              { shouldValidate: true },
                            )
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" {...register('isHandmade')} />
                <span className="text-sm font-medium">Handmade product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  {...register('isCustomizable')}
                />
                <span className="text-sm font-medium">Customizable</span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/seller/products')}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          isLoading={isSaving && !isPublishing}
          onClick={handleSubmit(() => saveProduct(true))}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          isLoading={isPublishing}
          onClick={handleSubmit(handlePublish)}
        >
          {isEditing ? 'Update & Publish' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
