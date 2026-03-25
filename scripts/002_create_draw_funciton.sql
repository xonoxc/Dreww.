CREATE OR REPLACE FUNCTION execute_monthly_draw(
  p_draw_type TEXT DEFAULT 'random'
) RETURNS JSON AS $$
DECLARE
  v_current_month DATE;
  v_draw_id UUID;
  v_eligible_users UUID[];
  v_draw_result JSON;
  v_first_winner UUID;
  v_second_winner UUID;
  v_third_winner UUID;
BEGIN
  v_current_month := DATE_TRUNC('month', NOW())::DATE;

  SELECT id INTO v_draw_id 
  FROM draws 
  WHERE EXTRACT(YEAR FROM draw_date) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM draw_date) = EXTRACT(MONTH FROM NOW())
    AND status != 'cancelled'
  LIMIT 1;

  IF v_draw_id IS NOT NULL THEN
    RETURN JSON_BUILD_OBJECT(
      'success', FALSE,
      'message', 'Draw already exists for this month',
      'draw_id', v_draw_id
    );
  END IF;

  SELECT ARRAY_AGG(DISTINCT user_id) INTO v_eligible_users
  FROM golf_scores
  WHERE DATE_TRUNC('month', score_date)::DATE = v_current_month
    AND user_id IN (
      SELECT id FROM profiles WHERE subscription_tier != 'free'
    );

  IF v_eligible_users IS NULL OR ARRAY_LENGTH(v_eligible_users, 1) = 0 THEN
    RETURN JSON_BUILD_OBJECT(
      'success', FALSE,
      'message', 'No eligible users for this month',
      'eligible_count', 0
    );
  END IF;

  INSERT INTO draws (
    draw_date,
    draw_type,
    status,
    total_prize_pool,
    eligible_count
  ) VALUES (
    NOW(),
    p_draw_type,
    'pending',
    10000,
    ARRAY_LENGTH(v_eligible_users, 1)
  ) RETURNING id INTO v_draw_id;

  CASE p_draw_type
    WHEN 'random' THEN
      -- Random selection from eligible users
      SELECT (ARRAY_AGG(user_id))[1] INTO v_first_winner
      FROM (
        SELECT user_id FROM unnest(v_eligible_users) AS user_id
        ORDER BY RANDOM() LIMIT 1
      ) t;

      SELECT (ARRAY_AGG(user_id))[1] INTO v_second_winner
      FROM (
        SELECT user_id FROM unnest(v_eligible_users) AS user_id
        WHERE user_id != v_first_winner
        ORDER BY RANDOM() LIMIT 1
      ) t;

      SELECT (ARRAY_AGG(user_id))[1] INTO v_third_winner
      FROM (
        SELECT user_id FROM unnest(v_eligible_users) AS user_id
        WHERE user_id != v_first_winner AND user_id != v_second_winner
        ORDER BY RANDOM() LIMIT 1
      ) t;

    WHEN 'algorithmic' THEN
      -- Best performing users (highest avg score last 5 rounds)
      SELECT (ARRAY_AGG(user_id ORDER BY avg_score DESC))[1] INTO v_first_winner
      FROM (
        SELECT 
          user_id,
          AVG(stableford_score) as avg_score
        FROM golf_scores
        WHERE DATE_TRUNC('month', score_date)::DATE = v_current_month
          AND user_id = ANY(v_eligible_users)
        GROUP BY user_id
        LIMIT 1
      ) t;

      SELECT (ARRAY_AGG(user_id ORDER BY avg_score DESC))[2] INTO v_second_winner
      FROM (
        SELECT 
          user_id,
          AVG(stableford_score) as avg_score
        FROM golf_scores
        WHERE DATE_TRUNC('month', score_date)::DATE = v_current_month
          AND user_id = ANY(v_eligible_users)
        GROUP BY user_id
        LIMIT 2
      ) t;

      SELECT (ARRAY_AGG(user_id ORDER BY avg_score DESC))[3] INTO v_third_winner
      FROM (
        SELECT 
          user_id,
          AVG(stableford_score) as avg_score
        FROM golf_scores
        WHERE DATE_TRUNC('month', score_date)::DATE = v_current_month
          AND user_id = ANY(v_eligible_users)
        GROUP BY user_id
        LIMIT 3
      ) t;

    ELSE -- hybrid (random + algorithmic mix)
      -- 50% best performers, 50% random
      SELECT (ARRAY_AGG(user_id ORDER BY avg_score DESC))[1] INTO v_first_winner
      FROM (
        SELECT 
          user_id,
          AVG(stableford_score) as avg_score
        FROM golf_scores
        WHERE DATE_TRUNC('month', score_date)::DATE = v_current_month
          AND user_id = ANY(v_eligible_users)
        GROUP BY user_id
        LIMIT 1
      ) t;

      SELECT (ARRAY_AGG(user_id))[1] INTO v_second_winner
      FROM (
        SELECT user_id FROM unnest(v_eligible_users) AS user_id
        WHERE user_id != v_first_winner
        ORDER BY RANDOM() LIMIT 1
      ) t;

      SELECT (ARRAY_AGG(user_id))[1] INTO v_third_winner
      FROM (
        SELECT user_id FROM unnest(v_eligible_users) AS user_id
        WHERE user_id != v_first_winner AND user_id != v_second_winner
        ORDER BY RANDOM() LIMIT 1
      ) t;
  END CASE;

  IF v_first_winner IS NOT NULL THEN
    INSERT INTO draw_results (draw_id, position, user_id, prize_amount, status)
    VALUES (v_draw_id, 1, v_first_winner, 4000, 'pending_verification');
  END IF;

  IF v_second_winner IS NOT NULL THEN
    INSERT INTO draw_results (draw_id, position, user_id, prize_amount, status)
    VALUES (v_draw_id, 2, v_second_winner, 3500, 'pending_verification');
  END IF;

  IF v_third_winner IS NOT NULL THEN
    INSERT INTO draw_results (draw_id, position, user_id, prize_amount, status)
    VALUES (v_draw_id, 3, v_third_winner, 2500, 'pending_verification');
  END IF;

  IF v_first_winner IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_first_winner,
      'draw_winner',
      'You Won!',
      'Congratulations! You won 1st prize (₹4000) in this month''s draw.',
      JSON_BUILD_OBJECT('draw_id', v_draw_id, 'position', 1, 'prize', 4000)
    );
  END IF;

  IF v_second_winner IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_second_winner,
      'draw_winner',
      'You Won!',
      'Congratulations! You won 2nd prize (₹3500) in this month''s draw.',
      JSON_BUILD_OBJECT('draw_id', v_draw_id, 'position', 2, 'prize', 3500)
    );
  END IF;

  IF v_third_winner IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_third_winner,
      'draw_winner',
      'You Won!',
      'Congratulations! You won 3rd prize (₹2500) in this month''s draw.',
      JSON_BUILD_OBJECT('draw_id', v_draw_id, 'position', 3, 'prize', 2500)
    );
  END IF;

  v_draw_result := JSON_BUILD_OBJECT(
    'success', TRUE,
    'draw_id', v_draw_id,
    'draw_type', p_draw_type,
    'eligible_count', ARRAY_LENGTH(v_eligible_users, 1),
    'winners', JSON_BUILD_OBJECT(
      'first', v_first_winner,
      'second', v_second_winner,
      'third', v_third_winner
    ),
    'message', 'Monthly draw executed successfully'
  );

  RETURN v_draw_result;
END;
$$ LANGUAGE plpgsql;
