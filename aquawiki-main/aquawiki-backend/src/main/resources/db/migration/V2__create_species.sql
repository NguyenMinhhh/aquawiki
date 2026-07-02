CREATE TABLE species (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    common_name     VARCHAR(150)   NOT NULL,
    scientific_name VARCHAR(200)   NOT NULL,
    image_url       VARCHAR(500),
    ph_min          DECIMAL(4,2)   NOT NULL,
    ph_max          DECIMAL(4,2)   NOT NULL,
    temp_min        DECIMAL(4,1)   NOT NULL,
    temp_max        DECIMAL(4,1)   NOT NULL,
    max_size_cm     DECIMAL(5,1)   NOT NULL,
    behavior_tag    ENUM('PEACEFUL','SEMI_AGGRESSIVE','AGGRESSIVE') NOT NULL,
    care_difficulty ENUM('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'MEDIUM',
    description     TEXT,
    bioload_factor  DECIMAL(4,2)   NOT NULL DEFAULT 1.00,
    status          ENUM('DRAFT','APPROVED') NOT NULL DEFAULT 'DRAFT',
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_species_common_name (common_name),
    INDEX idx_species_status (status),
    INDEX idx_species_behavior (behavior_tag)
);

-- Seed data: 10 loài cá phổ biến tại Việt Nam
INSERT INTO species (common_name, scientific_name, ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag, care_difficulty, bioload_factor, description, status) VALUES
('Cá Betta', 'Betta splendens', 6.0, 8.0, 24.0, 30.0, 7.0, 'AGGRESSIVE', 'EASY', 1.0,
 'Cá Betta (cá chọi) là loài cá cảnh nổi tiếng với vây dài, màu sắc rực rỡ. Con đực rất hung hăng với đồng loại, không nên nuôi chung nhiều con đực trong một bể.', 'APPROVED'),

('Cá Neon Tetra', 'Paracheirodon innesi', 6.0, 7.0, 20.0, 26.0, 4.0, 'PEACEFUL', 'EASY', 0.5,
 'Cá Neon Tetra là loài cá nhỏ, sống theo đàn, nổi bật với sọc xanh dương và đỏ chạy dọc thân. Rất hiền và phù hợp với các loài cá nhỏ khác.', 'APPROVED'),

('Cá Vàng Ryukin', 'Carassius auratus', 6.5, 8.0, 10.0, 24.0, 20.0, 'PEACEFUL', 'MEDIUM', 2.5,
 'Cá vàng Ryukin có thân tròn, đuôi kép dài, rất được ưa chuộng trong văn hóa châu Á. Cần bể lớn và lọc mạnh do tải lượng sinh học cao.', 'APPROVED'),

('Cá Guppy', 'Poecilia reticulata', 6.8, 7.8, 22.0, 28.0, 6.0, 'PEACEFUL', 'EASY', 0.5,
 'Cá Guppy là loài đẻ con, dễ nuôi, màu sắc phong phú. Con đực có đuôi dài, sặc sỡ. Sinh sản nhanh, phù hợp cho người mới chơi cá cảnh.', 'APPROVED'),

('Cá Molly', 'Poecilia sphenops', 7.0, 8.0, 24.0, 28.0, 12.0, 'PEACEFUL', 'EASY', 0.8,
 'Cá Molly đẻ con, khỏe mạnh, chịu được nước lợ. Tính hiền, phù hợp bể cộng đồng. Có nhiều màu: đen, vàng, bạch tạng.', 'APPROVED'),

('Cá Platy', 'Xiphophorus maculatus', 7.0, 8.2, 20.0, 28.0, 6.0, 'PEACEFUL', 'EASY', 0.6,
 'Cá Platy là loài đẻ con phổ biến, màu sắc đa dạng, rất dễ nuôi. Thích hợp cho bể cộng đồng và người mới bắt đầu chơi cá cảnh.', 'APPROVED'),

('Cá Otocinclus', 'Otocinclus affinis', 6.0, 7.5, 22.0, 26.0, 5.0, 'PEACEFUL', 'MEDIUM', 0.4,
 'Cá Otocinclus là loài cá dọn bể nhỏ, chuyên ăn tảo bám trên kính và lá cây thủy sinh. Sống theo đàn, nên nuôi ít nhất 6 con.', 'APPROVED'),

('Cá Corydoras', 'Corydoras paleatus', 6.0, 7.8, 18.0, 26.0, 7.0, 'PEACEFUL', 'EASY', 0.7,
 'Cá Corydoras là loài cá đáy hiền lành, dọn thức ăn thừa dưới nền bể. Sống theo đàn, cần nền cát mịn để bảo vệ râu.', 'APPROVED'),

('Cá Cichlid Phi Châu', 'Maylandia estherae', 7.8, 8.5, 24.0, 28.0, 12.0, 'AGGRESSIVE', 'MEDIUM', 1.5,
 'Cá Cichlid Phi Châu từ hồ Malawi có màu sắc rực rỡ nhưng rất hung hăng. Cần bể lớn với nhiều đá làm chỗ ẩn nấp, không nuôi chung với cá hiền.', 'APPROVED'),

('Cá Pleco Hoàng Đế', 'Hypancistrus zebra', 6.0, 7.5, 26.0, 30.0, 10.0, 'PEACEFUL', 'HARD', 1.2,
 'Cá Pleco Vằn (L046) là loài cá dọn bể quý hiếm với hoa văn sọc đen trắng đẹp mắt. Cần nước sạch, giàu oxy, nhiệt độ ổn định. Giá trị kinh tế cao.', 'APPROVED');
