-- More popular aquarium species so AI identification matches common photos.
-- Scientific names chosen to match what Fishial.AI returns.
INSERT INTO species (common_name, scientific_name, ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag, care_difficulty, bioload_factor, description, status) VALUES
('Cá Dĩa', 'Symphysodon aequifasciatus', 6.0, 7.0, 28.0, 30.0, 20.0, 'PEACEFUL', 'HARD', 2.0,
 'Cá Dĩa là "nữ hoàng" của bể thủy sinh, thân tròn dẹp, màu sắc rực rỡ. Cần nước rất sạch, nhiệt độ cao và ổn định, hợp nuôi theo đàn. Nhạy cảm, dành cho người chơi có kinh nghiệm.', 'APPROVED'),

('Cá Dĩa Heckel', 'Symphysodon discus', 5.5, 6.8, 28.0, 31.0, 20.0, 'PEACEFUL', 'HARD', 2.0,
 'Cá Dĩa Heckel có sọc đen đậm giữa thân đặc trưng. Khó nuôi hơn dĩa thường, đòi hỏi nước mềm, axit nhẹ và cực kỳ sạch.', 'APPROVED'),

('Cá Ông Tiên', 'Pterophyllum scalare', 6.0, 7.5, 24.0, 30.0, 15.0, 'SEMI_AGGRESSIVE', 'MEDIUM', 1.5,
 'Cá Ông Tiên (Thần Tiên) có thân dẹp cao, vây dài thướt tha. Tương đối hiền nhưng có thể ăn cá quá nhỏ. Cần bể cao do chiều cao thân lớn.', 'APPROVED'),

('Cá Oscar', 'Astronotus ocellatus', 6.0, 8.0, 23.0, 27.0, 35.0, 'AGGRESSIVE', 'MEDIUM', 3.0,
 'Cá Oscar thông minh, nhận biết chủ, nhưng rất hung dữ và cỡ lớn. Cần bể lớn, lọc mạnh. Không nuôi chung với cá nhỏ vì sẽ bị ăn thịt.', 'APPROVED'),

('Cá Tứ Vân', 'Puntigrus tetrazona', 6.0, 8.0, 22.0, 26.0, 7.0, 'SEMI_AGGRESSIVE', 'EASY', 0.6,
 'Cá Tứ Vân sọc đen trên thân vàng cam, hoạt bát theo đàn. Hay rỉa vây cá vây dài (Betta, Ông Tiên), nên nuôi đàn lớn để giảm hung hăng.', 'APPROVED'),

('Cá Ngựa Vằn', 'Danio rerio', 6.5, 7.5, 18.0, 25.0, 5.0, 'PEACEFUL', 'EASY', 0.4,
 'Cá Ngựa Vằn sọc xanh bạc, cực khỏe và dễ nuôi, bơi nhanh theo đàn. Lý tưởng cho người mới và bể cộng đồng mát.', 'APPROVED'),

('Cá Hồng Nhung', 'Paracheirodon axelrodi', 5.5, 7.0, 23.0, 27.0, 5.0, 'PEACEFUL', 'MEDIUM', 0.4,
 'Cá Hồng Nhung (Cardinal Tetra) có sọc đỏ và xanh chạy hết thân, rực rỡ hơn Neon. Sống đàn, thích nước mềm axit nhẹ.', 'APPROVED'),

('Cá Sặc Gấm', 'Trichogaster lalius', 6.0, 7.5, 22.0, 28.0, 8.0, 'PEACEFUL', 'EASY', 0.8,
 'Cá Sặc Gấm (Dwarf Gourami) màu sắc sặc sỡ, hiền, thở khí trời. Hợp bể cộng đồng yên tĩnh, có nhiều cây thủy sinh.', 'APPROVED'),

('Cá Kiếm', 'Xiphophorus hellerii', 7.0, 8.0, 22.0, 28.0, 14.0, 'PEACEFUL', 'EASY', 0.7,
 'Cá Kiếm (Swordtail) đẻ con, con đực có đuôi kéo dài như thanh kiếm. Khỏe, dễ nuôi, sinh sản nhanh.', 'APPROVED'),

('Cá Phượng Hoàng', 'Mikrogeophagus ramirezi', 5.5, 7.0, 26.0, 30.0, 7.0, 'PEACEFUL', 'MEDIUM', 0.6,
 'Cá Phượng Hoàng (Ram) là cá rồng lùn màu sắc rực rỡ, hiền với loài khác nhưng có lãnh thổ khi sinh sản. Cần nước ấm, sạch.', 'APPROVED'),

('Cá Chuột Đồng', 'Corydoras aeneus', 6.0, 7.8, 22.0, 28.0, 7.0, 'PEACEFUL', 'EASY', 0.7,
 'Cá Chuột Đồng (Bronze Cory) màu đồng ánh xanh, dọn đáy hiền lành, sống đàn. Cần nền cát mịn để bảo vệ râu.', 'APPROVED'),

('Cá Koi', 'Cyprinus rubrofuscus', 7.0, 8.5, 15.0, 25.0, 60.0, 'PEACEFUL', 'MEDIUM', 3.5,
 'Cá Koi cảnh nuôi hồ ngoài trời, biểu tượng may mắn. Cỡ rất lớn, tải sinh học cao, cần hồ lớn và lọc mạnh.', 'APPROVED'),

('Cá Rồng Kim Long', 'Scleropages formosus', 6.5, 7.5, 24.0, 30.0, 90.0, 'AGGRESSIVE', 'HARD', 4.0,
 'Cá Rồng (Arowana) là loài cá phong thủy quý giá, săn mồi mặt nước, cỡ rất lớn và hung dữ. Cần bể cực lớn, nuôi đơn.', 'APPROVED');
