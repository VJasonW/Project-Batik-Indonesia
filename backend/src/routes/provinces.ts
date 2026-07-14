import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/provinces - List all provinces with motif count
router.get('/', async (_req: Request, res: Response) => {
  try {
    const provinces = await prisma.province.findMany({
      include: {
        _count: {
          select: { motifs: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(provinces.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      capital: p.capital,
      region: p.region,
      geoId: p.geoId,
      shortDescription: p.shortDescription,
      accentColor: p.accentColor,
      motifCount: p._count.motifs,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data provinsi' });
  }
});

// GET /api/provinces/:slug - Province detail with all motifs
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const province = await prisma.province.findUnique({
      where: { slug },
      include: {
        motifs: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!province) {
      res.status(404).json({ error: 'Provinsi tidak ditemukan' });
      return;
    }

    res.json(province);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data provinsi' });
  }
});

// GET /api/provinces/:slug/motifs/summary - Short motif list for tooltip
router.get('/:slug/motifs/summary', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const province = await prisma.province.findUnique({
      where: { slug },
      include: {
        motifs: {
          select: { id: true, name: true },
          take: 5,
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { motifs: true },
        },
      },
    });

    if (!province) {
      res.status(404).json({ error: 'Provinsi tidak ditemukan' });
      return;
    }

    const data = province as any;
    res.json({
      provinceName: data.name,
      slug: data.slug,
      accentColor: data.accentColor,
      motifs: data.motifs,
      totalMotifs: data._count.motifs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil ringkasan motif' });
  }
});

// PUT /api/provinces/:slug/accent-color - Update accent color (admin only)
router.put('/:slug/accent-color', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const { accentColor } = req.body;

    if (!accentColor || !/^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
      res.status(400).json({ error: 'Format warna aksen tidak valid. Harus format HEX (contoh: #FF5733)' });
      return;
    }

    const updatedProvince = await prisma.province.update({
      where: { slug },
      data: { accentColor },
    });

    res.json(updatedProvince);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui warna aksen' });
  }
});

// PUT /api/provinces/:slug - Update province data (admin only)
router.put('/:slug', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const { shortDescription, accentColor } = req.body;

    const data: any = {};
    if (shortDescription !== undefined) data.shortDescription = shortDescription;
    if (accentColor !== undefined) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
        res.status(400).json({ error: 'Format warna aksen tidak valid. Harus format HEX (contoh: #FF5733)' });
        return;
      }
      data.accentColor = accentColor;
    }

    const updatedProvince = await prisma.province.update({
      where: { slug },
      data,
    });

    res.json(updatedProvince);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui data provinsi' });
  }
});

export default router;
