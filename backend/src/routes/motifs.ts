import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/motifs/:id - Get single motif detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const motif = await prisma.batikMotif.findUnique({
      where: { id },
      include: {
        province: {
          select: { id: true, slug: true, name: true },
        },
      },
    });

    if (!motif) {
      res.status(404).json({ error: 'Motif batik tidak ditemukan' });
      return;
    }

    res.json(motif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data motif' });
  }
});

// POST /api/motifs - Create new motif (admin only)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, provinceId, shortSummary, history, meaning, originCity, imageUrl } = req.body;

    if (!name || !provinceId) {
      res.status(400).json({ error: 'Nama motif dan provinsi wajib diisi' });
      return;
    }

    const province = await prisma.province.findUnique({ where: { id: parseInt(provinceId) } });
    if (!province) {
      res.status(404).json({ error: 'Provinsi tidak ditemukan' });
      return;
    }

    const motif = await prisma.batikMotif.create({
      data: {
        name,
        provinceId: parseInt(provinceId),
        shortSummary: shortSummary || null,
        history: history || null,
        meaning: meaning || null,
        originCity: originCity || null,
        imageUrl: imageUrl || null,
      },
    });

    res.status(201).json(motif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan motif batik' });
  }
});

// PUT /api/motifs/:id - Update motif (admin only)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, shortSummary, history, meaning, originCity, imageUrl } = req.body;

    const existing = await prisma.batikMotif.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Motif batik tidak ditemukan' });
      return;
    }

    const motif = await prisma.batikMotif.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(shortSummary !== undefined && { shortSummary }),
        ...(history !== undefined && { history }),
        ...(meaning !== undefined && { meaning }),
        ...(originCity !== undefined && { originCity }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    res.json(motif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengupdate motif batik' });
  }
});

// DELETE /api/motifs/:id - Delete motif (admin only)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const existing = await prisma.batikMotif.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Motif batik tidak ditemukan' });
      return;
    }

    await prisma.batikMotif.delete({ where: { id } });
    res.json({ message: 'Motif batik berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus motif batik' });
  }
});

export default router;
