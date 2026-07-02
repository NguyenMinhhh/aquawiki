-- Seed data từ V2: Betta=1, NeonTetra=2, Guppy=4, Corydoras=8, Cichlid=9
-- species_id_a < species_id_b always

INSERT INTO species_compatibility (species_id_a, species_id_b, level, note, verified_by) VALUES
-- Betta (1) + Neon Tetra (2): CAUTION — Betta có thể rỉa vây cá nhỏ
(1, 2, 'CAUTION',
 'Cá Betta đôi khi tấn công cá nhỏ có vây dài. Cần bể đủ lớn và nhiều nơi ẩn náu.',
 'AquaWiki Team'),

-- Betta (1) + Guppy (4): INCOMPATIBLE — Betta thường tấn công Guppy vì nhầm đồng loại
(1, 4, 'INCOMPATIBLE',
 'Cá Betta thường tấn công Guppy do màu sắc và vây đuôi dài của Guppy đực kích thích phản xạ chiến đấu.',
 'AquaWiki Team'),

-- Betta (1) + Corydoras (8): COMPATIBLE — Corydoras sống đáy, không xung đột
(1, 8, 'COMPATIBLE',
 'Cá Corydoras sống ở tầng đáy và không cạnh tranh lãnh thổ với Betta. Cặp đôi phù hợp cho bể nhỏ.',
 'AquaWiki Team'),

-- Cichlid (9) + NeonTetra (2): INCOMPATIBLE — Cichlid hung hăng, Neon Tetra quá nhỏ
(2, 9, 'INCOMPATIBLE',
 'Cá Cichlid Phi Châu rất hung hăng và có thể coi Neon Tetra là con mồi do kích thước chênh lệch lớn.',
 'AquaWiki Team'),

-- Cichlid (9) + Corydoras (8): CAUTION — Cichlid có thể bắt nạt Corydoras
(8, 9, 'CAUTION',
 'Cá Cichlid Phi Châu hung hăng có thể bắt nạt Corydoras. Cần bể đủ lớn với nhiều đá che chắn.',
 'AquaWiki Team');
