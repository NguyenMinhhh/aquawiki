package com.aquawiki.service;

import com.aquawiki.dto.TankRequest;
import com.aquawiki.dto.TankResponse;
import com.aquawiki.model.MaintenanceEventType;
import com.aquawiki.model.ReminderStatus;
import com.aquawiki.model.Species;
import com.aquawiki.model.Tank;
import com.aquawiki.model.TankMaintenanceLog;
import com.aquawiki.model.TankSpecies;
import com.aquawiki.model.User;
import com.aquawiki.repository.SpeciesRepository;
import com.aquawiki.repository.TankMaintenanceLogRepository;
import com.aquawiki.repository.TankRepository;
import com.aquawiki.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TankService {

    private static final BigDecimal LITER_DIVISOR = new BigDecimal("1000");

    private final TankRepository tankRepo;
    private final TankMaintenanceLogRepository logRepo;
    private final UserRepository userRepo;
    private final SpeciesRepository speciesRepo;

    @Transactional(readOnly = true)
    public List<TankResponse> list(String email) {
        Long userId = requireUser(email).getId();
        LocalDate today = LocalDate.now();
        return tankRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(t -> TankResponse.from(t, today))
                .toList();
    }

    @Transactional(readOnly = true)
    public TankResponse get(String email, Long id) {
        return TankResponse.from(requireOwnedTank(email, id), LocalDate.now());
    }

    @Transactional
    public TankResponse create(String email, TankRequest request) {
        User user = requireUser(email);
        Tank tank = new Tank();
        tank.setUser(user);
        applyRequest(tank, request);
        return TankResponse.from(tankRepo.save(tank), LocalDate.now());
    }

    @Transactional
    public TankResponse update(String email, Long id, TankRequest request) {
        Tank tank = requireOwnedTank(email, id);
        applyRequest(tank, request);
        return TankResponse.from(tankRepo.save(tank), LocalDate.now());
    }

    @Transactional
    public void delete(String email, Long id) {
        Tank tank = requireOwnedTank(email, id);
        tankRepo.delete(tank);
    }

    /** Reminders computed on read — tanks whose water change is DUE or OVERDUE. */
    @Transactional(readOnly = true)
    public List<TankResponse> reminders(String email) {
        Long userId = requireUser(email).getId();
        LocalDate today = LocalDate.now();
        return tankRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(t -> TankResponse.from(t, today))
                .filter(r -> r.reminderStatus() != ReminderStatus.OK)
                .toList();
    }

    /** Mark a water change as done: log the event, reset last_water_change_date to today. */
    @Transactional
    public TankResponse markWaterChange(String email, Long id) {
        Tank tank = requireOwnedTank(email, id);
        LocalDate today = LocalDate.now();

        tank.setLastWaterChangeDate(today);
        tankRepo.save(tank);

        TankMaintenanceLog log = new TankMaintenanceLog();
        log.setTank(tank);
        log.setEventType(MaintenanceEventType.WATER_CHANGE);
        log.setEventDate(today);
        log.setNote("Thay nước");
        logRepo.save(log);

        return TankResponse.from(tank, today);
    }

    // ── helpers ──

    private void applyRequest(Tank tank, TankRequest request) {
        tank.setName(request.name());
        tank.setLengthCm(request.lengthCm());
        tank.setWidthCm(request.widthCm());
        tank.setHeightCm(request.heightCm());
        tank.setVolumeLiters(computeVolume(request.lengthCm(), request.widthCm(), request.heightCm()));
        tank.setWaterChangeIntervalDays(request.waterChangeIntervalDays());
        tank.setLastWaterChangeDate(request.lastWaterChangeDate());
        syncSpecies(tank, request);
    }

    /** Merge the requested species composition into the tank without delete+reinsert of unchanged rows. */
    private void syncSpecies(Tank tank, TankRequest request) {
        Map<Long, Integer> desired = new LinkedHashMap<>();
        if (request.species() != null) {
            for (TankRequest.TankSpeciesItem item : request.species()) {
                if (item == null || item.speciesId() == null) continue;
                desired.put(item.speciesId(), item.quantity() == null ? 1 : item.quantity());
            }
        }
        // Remove species no longer present
        tank.getSpecies().removeIf(ts -> !desired.containsKey(ts.getSpecies().getId()));
        // Update quantities of those still present
        for (TankSpecies ts : tank.getSpecies()) {
            Integer q = desired.remove(ts.getSpecies().getId());
            if (q != null) ts.setQuantity(q);
        }
        // Add the new ones
        for (Map.Entry<Long, Integer> e : desired.entrySet()) {
            Species s = speciesRepo.findById(e.getKey())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Loài không tồn tại: " + e.getKey()));
            TankSpecies ts = new TankSpecies();
            ts.setTank(tank);
            ts.setSpecies(s);
            ts.setQuantity(e.getValue());
            tank.getSpecies().add(ts);
        }
    }

    private BigDecimal computeVolume(BigDecimal l, BigDecimal w, BigDecimal h) {
        return l.multiply(w).multiply(h)
                .divide(LITER_DIVISOR, 2, RoundingMode.HALF_UP);
    }

    private User requireUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Tank requireOwnedTank(String email, Long id) {
        Long userId = requireUser(email).getId();
        Tank tank = tankRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tank not found"));
        if (!tank.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your tank");
        }
        return tank;
    }
}
