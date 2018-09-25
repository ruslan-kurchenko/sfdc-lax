public with sharing class ContactController {
	@AuraEnabled
	public static Contact getByEmail(String email) {
		return [
				SELECT Id, Name, Email
				FROM Contact
				WHERE Email = :email
		];
	}
}