      };
    } catch (error) {
      if (attempt === maxRetries) {
        throw error; // Rethrow the error if all retries are exhausted
      }
      console.warn(`Payment attempt ${attempt} failed. Retrying...`);
    }
  }