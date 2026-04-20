package com.lifelink.lifelink.backend.repository;

import com.lifelink.lifelink.backend.entity.UserMetaInfo;
import com.lifelink.lifelink.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserMetaInfoRepository extends JpaRepository<UserMetaInfo, UUID> {
    Optional<UserMetaInfo> findByUser(User user);
    Optional<UserMetaInfo> findByUserId(UUID userId);
}
