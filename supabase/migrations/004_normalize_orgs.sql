-- Normalize organizations to canonical list.
-- Known aliases are remapped; anything not in the list is removed.
UPDATE profiles
SET organizations = (
  SELECT COALESCE(array_agg(DISTINCT normalized ORDER BY normalized), '{}')
  FROM (
    SELECT
      CASE trim(unnested)
        -- canonical pass-throughs
        WHEN 'Disrupt'   THEN 'Disrupt'
        WHEN 'E-Club'    THEN 'E-Club'
        WHEN 'Evolve'    THEN 'Evolve'
        WHEN 'Forge'     THEN 'Forge'
        WHEN 'Generate'  THEN 'Generate'
        WHEN 'IDEA'      THEN 'IDEA'
        WHEN 'NUImpact'  THEN 'NUImpact'
        WHEN 'NUMA'      THEN 'NUMA'
        WHEN 'rev'       THEN 'rev'
        WHEN 'Scout'     THEN 'Scout'
        WHEN 'ViTAL'     THEN 'ViTAL'
        WHEN 'WISE'      THEN 'WISE'
        -- common aliases from old data
        WHEN 'Generate Northeastern' THEN 'Generate'
        WHEN 'Generate NU'           THEN 'Generate'
        WHEN 'NU Impact'             THEN 'NUImpact'
        WHEN 'nu impact'             THEN 'NUImpact'
        WHEN 'nuimpact'              THEN 'NUImpact'
        WHEN 'E Club'                THEN 'E-Club'
        WHEN 'Eclub'                 THEN 'E-Club'
        ELSE NULL
      END AS normalized
    FROM unnest(organizations) AS unnested
  ) sub
  WHERE normalized IS NOT NULL
)
WHERE organizations IS NOT NULL;
