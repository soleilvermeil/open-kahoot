import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('complete game flow from host creation to player joining', async ({ page, context }) => {
    // Host creates a game
    await page.goto('/host');
    
    // Fill in game details
    await page.fill('input[placeholder*="title" i]', 'Test Game');
    
    // Add a question (assuming there's an interface for this)
    const addQuestionButton = page.locator('button', { hasText: /add.*question/i });
    if (await addQuestionButton.isVisible()) {
      await addQuestionButton.click();
      
      await page.fill('input[placeholder*="question" i]', 'What is 2+2?');
      await page.fill('input[placeholder*="option" i]').first().fill('3');
      await page.fill('input[placeholder*="option" i]').nth(1).fill('4');
      await page.fill('input[placeholder*="option" i]').nth(2).fill('5');
      await page.fill('input[placeholder*="option" i]').nth(3).fill('6');
      
      // Set correct answer (index 1 for "4")
      await page.click('input[type="radio"][value="1"]');
    }
    
    // Create the game
    await page.click('button', { hasText: /create.*game/i });
    
    // Should be redirected to game page with PIN
    await expect(page).toHaveURL(/\/game\/[a-f0-9-]+/);
    
    // Get the game PIN
    const pinElement = page.locator('[data-testid="game-pin"], .game-pin, .pin');
    await expect(pinElement).toBeVisible();
    const pin = await pinElement.textContent();
    
    expect(pin).toMatch(/^\d{6}$/);
    
    // Open a new page for player
    const playerPage = await context.newPage();
    await playerPage.goto('/join');
    
    // Player joins the game
    await playerPage.fill('input[placeholder*="pin" i]', pin!);
    await playerPage.fill('input[placeholder*="name" i]', 'TestPlayer');
    await playerPage.click('button', { hasText: /join/i });
    
    // Verify player joined successfully
    await expect(playerPage).toHaveURL(/\/game\/[a-f0-9-]+/);
    
    // Host should see the player in the lobby
    await expect(page.locator('text=TestPlayer')).toBeVisible();
    
    // Host starts the game
    await page.click('button', { hasText: /start.*game/i });
    
    // Both pages should show the question
    await expect(page.locator('text=What is 2+2?')).toBeVisible();
    await expect(playerPage.locator('text=What is 2+2?')).toBeVisible();
    
    // Player answers the question
    await playerPage.click('button', { hasText: '4' });
    
    // Host should see that player answered
    await expect(page.locator('text=1/1 answered', { timeout: 10000 })).toBeVisible();
    
    // Host moves to results
    await page.click('button', { hasText: /next|results/i });
    
    // Both should see results
    await expect(page.locator('text=Correct!')).toBeVisible();
    await expect(playerPage.locator('text=Correct!')).toBeVisible();
    
    // Check leaderboard
    await page.click('button', { hasText: /leaderboard/i });
    
    // Player should be on leaderboard with points
    await expect(page.locator('text=TestPlayer')).toBeVisible();
    await expect(page.locator('text=TestPlayer').locator('..').locator('text=/\\d+/')).toBeVisible();
  });
  
  test('player reconnection works correctly', async ({ page, context }) => {
    // Create a game and have player join (abbreviated version)
    await page.goto('/host');
    await page.fill('input[placeholder*="title" i]', 'Reconnection Test');
    await page.click('button', { hasText: /create.*game/i });
    
    const pinElement = page.locator('[data-testid="game-pin"], .game-pin, .pin');
    const pin = await pinElement.textContent();
    
    const playerPage = await context.newPage();
    await playerPage.goto('/join');
    await playerPage.fill('input[placeholder*="pin" i]', pin!);
    await playerPage.fill('input[placeholder*="name" i]', 'ReconnectPlayer');
    await playerPage.click('button', { hasText: /join/i });
    
    // Verify player joined
    await expect(page.locator('text=ReconnectPlayer')).toBeVisible();
    
    // Simulate disconnection by closing player page
    await playerPage.close();
    
    // Player should be marked as disconnected on host view
    await expect(page.locator('text=ReconnectPlayer').locator('..').locator('text=/disconnected/i')).toBeVisible({ timeout: 10000 });
    
    // Player reconnects
    const newPlayerPage = await context.newPage();
    await newPlayerPage.goto('/join');
    await newPlayerPage.fill('input[placeholder*="pin" i]', pin!);
    await newPlayerPage.fill('input[placeholder*="name" i]', 'ReconnectPlayer');
    await newPlayerPage.click('button', { hasText: /join/i });
    
    // Player should be reconnected
    await expect(page.locator('text=ReconnectPlayer').locator('..').locator('text=/connected/i')).toBeVisible({ timeout: 10000 });
  });
  
  test('handles invalid game PIN gracefully', async ({ page }) => {
    await page.goto('/join');
    
    // Try to join with invalid PIN
    await page.fill('input[placeholder*="pin" i]', '999999');
    await page.fill('input[placeholder*="name" i]', 'TestPlayer');
    await page.click('button', { hasText: /join/i });
    
    // Should show error message
    await expect(page.locator('text=/game.*not.*found|invalid.*pin/i')).toBeVisible();
    
    // Should stay on join page
    await expect(page).toHaveURL('/join');
  });
}); 